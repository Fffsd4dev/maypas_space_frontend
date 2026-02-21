import { useEffect, useState, useRef } from "react";
import { Card, Pagination } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";
import { useLogoColor } from "@/context/LogoColorContext";

const UsersBalances = () => {
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { colour: primary } = useLogoColor();
  
  // Use multiple refs to track fetch state
  const fetchedRef = useRef(false);
  const tokenRef = useRef(user?.token);
  const tenantSlugRef = useRef(tenantSlug);

  const itemsPerPage = 10;

  // Update refs when values change
  useEffect(() => {
    tokenRef.current = user?.token;
  }, [user?.token]);

  useEffect(() => {
    tenantSlugRef.current = tenantSlug;
  }, [tenantSlug]);

  // Add custom pagination styles
  useEffect(() => {
    if (primary) {
      const style = document.createElement('style');
      style.innerHTML = `
        .custom-pagination .page-item.active .page-link {
          background-color: ${primary} !important;
          border-color: ${primary} !important;
          color: #fff !important;
        }
        
        .custom-pagination .page-link {
          color: ${primary} !important;
        }
        
        .custom-pagination .page-link:hover {
          color: ${primary} !important;
          background-color: ${primary}20 !important;
          border-color: ${primary} !important;
        }
        
        .custom-pagination .page-link:focus {
          box-shadow: 0 0 0 0.25rem ${primary}40 !important;
          color: ${primary} !important;
        }
        
        .custom-pagination .page-item.disabled .page-link {
          color: #6c757d !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [primary]);

  useEffect(() => {
    // Skip if already fetched
    if (fetchedRef.current) return;
    
    // Skip if no token
    if (!tokenRef.current) {
      setLoading(false);
      return;
    }

    const fetchBalances = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugRef.current}/analytics/accounts?startTimeA=${startDate}&endTimeA=${endDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch account balances");

        const data = await res.json();
        setBalances(data);
        fetchedRef.current = true; // Mark as fetched
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (loading) return <div>Loading user balances...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!balances.length) return <div>No balances found</div>;

  // Pagination logic
  const totalPages = Math.ceil(balances.length / itemsPerPage);
  const paginatedData = balances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Amount Spent by Users</h4>
        <div className="table-responsive">
          <table className="table table-borderless table-hover table-nowrap table-centered m-0">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Amount Spent</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, i) => (
                <tr key={i}>
                  <td>
                    <h5 className="m-0 fw-normal">
                      {item.name
                        ? item.name
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : ''}
                    </h5>
                  </td>
                  <td>{Number(item.fee).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {balances.length > 0 && (
          <Pagination className="mt-3 justify-content-center custom-pagination">
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={currentPage === idx + 1}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </Card.Body>
    </Card>
  );
};

export default UsersBalances;



