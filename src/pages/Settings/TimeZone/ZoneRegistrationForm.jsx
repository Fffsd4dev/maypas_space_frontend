import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const TIMEZONES =  
 [
  {
    "timezone": "Africa/Abidjan",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Accra",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Bamako",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Banjul",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Bissau",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Conakry",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Dakar",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Freetown",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Lome",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Monrovia",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Nouakchott",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Ouagadougou",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Sao_Tome",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Timbuktu",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "America/Danmarkshavn",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Atlantic/Azores",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Atlantic/Reykjavik",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Atlantic/St_Helena",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/GMT",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/GMT+0",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/GMT-0",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/GMT0",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/Greenwich",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/UCT",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/UTC",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/Universal",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Etc/Zulu",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "GMT",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "GMT+0",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "GMT-0",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "GMT0",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Greenwich",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Iceland",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "UCT",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "UTC",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Universal",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Zulu",
    "utc_time_zone": "+00:00"
  },
  {
    "timezone": "Africa/Algiers",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Bangui",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Brazzaville",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Casablanca",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Douala",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/El_Aaiun",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Kinshasa",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Lagos",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Libreville",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Luanda",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Malabo",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Ndjamena",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Niamey",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Porto-Novo",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Tunis",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Atlantic/Canary",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Atlantic/Faeroe",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Atlantic/Faroe",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Atlantic/Madeira",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Eire",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Etc/GMT-1",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/Belfast",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/Dublin",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/Guernsey",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/Isle_of_Man",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/Jersey",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/Lisbon",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Europe/London",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "GB",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "GB-Eire",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Portugal",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "WET",
    "utc_time_zone": "+01:00"
  },
  {
    "timezone": "Africa/Blantyre",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Bujumbura",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Ceuta",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Gaborone",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Harare",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Johannesburg",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Juba",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Khartoum",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Kigali",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Lubumbashi",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Lusaka",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Maputo",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Maseru",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Mbabane",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Tripoli",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Windhoek",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Antarctica/Troll",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Arctic/Longyearbyen",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Atlantic/Jan_Mayen",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "CET",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Etc/GMT-2",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Amsterdam",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Andorra",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Belgrade",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Berlin",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Bratislava",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Brussels",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Budapest",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Busingen",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Copenhagen",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Gibraltar",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Kaliningrad",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Ljubljana",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Luxembourg",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Madrid",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Malta",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Monaco",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Oslo",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Paris",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Podgorica",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Prague",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Rome",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/San_Marino",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Sarajevo",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Skopje",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Stockholm",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Tirane",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Vaduz",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Vatican",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Vienna",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Warsaw",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Zagreb",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Europe/Zurich",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Libya",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "MET",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Poland",
    "utc_time_zone": "+02:00"
  },
  {
    "timezone": "Africa/Addis_Ababa",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Asmara",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Asmera",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Cairo",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Dar_es_Salaam",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Djibouti",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Kampala",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Mogadishu",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Africa/Nairobi",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Antarctica/Syowa",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Aden",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Amman",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Baghdad",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Bahrain",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Beirut",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Damascus",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Famagusta",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Gaza",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Hebron",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Istanbul",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Jerusalem",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Kuwait",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Nicosia",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Qatar",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Riyadh",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Tel_Aviv",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "EET",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Egypt",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Etc/GMT-3",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Athens",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Bucharest",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Chisinau",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Helsinki",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Istanbul",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Kiev",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Kirov",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Kyiv",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Mariehamn",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Minsk",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Moscow",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Nicosia",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Riga",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Simferopol",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Sofia",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Tallinn",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Tiraspol",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Uzhgorod",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Vilnius",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Volgograd",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Europe/Zaporozhye",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Indian/Antananarivo",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Indian/Comoro",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Indian/Mayotte",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Israel",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Turkey",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "W-SU",
    "utc_time_zone": "+03:00"
  },
  {
    "timezone": "Asia/Tehran",
    "utc_time_zone": "+03:30"
  },
  {
    "timezone": "Iran",
    "utc_time_zone": "+03:30"
  },
  {
    "timezone": "Asia/Baku",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Asia/Dubai",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Asia/Muscat",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Asia/Tbilisi",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Asia/Yerevan",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Etc/GMT-4",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Europe/Astrakhan",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Europe/Samara",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Europe/Saratov",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Europe/Ulyanovsk",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Indian/Mahe",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Indian/Mauritius",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Indian/Reunion",
    "utc_time_zone": "+04:00"
  },
  {
    "timezone": "Asia/Kabul",
    "utc_time_zone": "+04:30"
  },
  {
    "timezone": "Antarctica/Mawson",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Antarctica/Vostok",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Almaty",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Aqtau",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Aqtobe",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Ashgabat",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Ashkhabad",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Atyrau",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Dushanbe",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Karachi",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Oral",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Qostanay",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Qyzylorda",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Samarkand",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Tashkent",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Yekaterinburg",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Etc/GMT-5",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Indian/Kerguelen",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Indian/Maldives",
    "utc_time_zone": "+05:00"
  },
  {
    "timezone": "Asia/Calcutta",
    "utc_time_zone": "+05:30"
  },
  {
    "timezone": "Asia/Colombo",
    "utc_time_zone": "+05:30"
  },
  {
    "timezone": "Asia/Kolkata",
    "utc_time_zone": "+05:30"
  },
  {
    "timezone": "Asia/Kathmandu",
    "utc_time_zone": "+05:45"
  },
  {
    "timezone": "Asia/Katmandu",
    "utc_time_zone": "+05:45"
  },
  {
    "timezone": "Asia/Bishkek",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Dacca",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Dhaka",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Kashgar",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Omsk",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Thimbu",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Thimphu",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Urumqi",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Etc/GMT-6",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Indian/Chagos",
    "utc_time_zone": "+06:00"
  },
  {
    "timezone": "Asia/Rangoon",
    "utc_time_zone": "+06:30"
  },
  {
    "timezone": "Asia/Yangon",
    "utc_time_zone": "+06:30"
  },
  {
    "timezone": "Indian/Cocos",
    "utc_time_zone": "+06:30"
  },
  {
    "timezone": "Antarctica/Davis",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Bangkok",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Barnaul",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Ho_Chi_Minh",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Hovd",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Jakarta",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Krasnoyarsk",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Novokuznetsk",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Novosibirsk",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Phnom_Penh",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Pontianak",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Saigon",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Tomsk",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Asia/Vientiane",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Etc/GMT-7",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Indian/Christmas",
    "utc_time_zone": "+07:00"
  },
  {
    "timezone": "Antarctica/Casey",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Brunei",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Choibalsan",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Chongqing",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Chungking",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Harbin",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Hong_Kong",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Irkutsk",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Kuala_Lumpur",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Kuching",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Macao",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Macau",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Makassar",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Manila",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Shanghai",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Singapore",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Taipei",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Ujung_Pandang",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Ulaanbaatar",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Asia/Ulan_Bator",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Australia/Perth",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Australia/West",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Etc/GMT-8",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Hongkong",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "PRC",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "ROC",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Singapore",
    "utc_time_zone": "+08:00"
  },
  {
    "timezone": "Australia/Eucla",
    "utc_time_zone": "+08:45"
  },
  {
    "timezone": "Asia/Chita",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Dili",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Jayapura",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Khandyga",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Pyongyang",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Seoul",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Tokyo",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Asia/Yakutsk",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Etc/GMT-9",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Japan",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Pacific/Palau",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "ROK",
    "utc_time_zone": "+09:00"
  },
  {
    "timezone": "Australia/Adelaide",
    "utc_time_zone": "+09:30"
  },
  {
    "timezone": "Australia/Broken_Hill",
    "utc_time_zone": "+09:30"
  },
  {
    "timezone": "Australia/Darwin",
    "utc_time_zone": "+09:30"
  },
  {
    "timezone": "Australia/North",
    "utc_time_zone": "+09:30"
  },
  {
    "timezone": "Australia/South",
    "utc_time_zone": "+09:30"
  },
  {
    "timezone": "Australia/Yancowinna",
    "utc_time_zone": "+09:30"
  },
  {
    "timezone": "Antarctica/DumontDUrville",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Antarctica/Macquarie",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Asia/Ust-Nera",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Asia/Vladivostok",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/ACT",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Brisbane",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Canberra",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Currie",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Hobart",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Lindeman",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Melbourne",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/NSW",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Queensland",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Sydney",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Tasmania",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/Victoria",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Etc/GMT-10",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Pacific/Chuuk",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Pacific/Guam",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Pacific/Port_Moresby",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Pacific/Saipan",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Pacific/Truk",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Pacific/Yap",
    "utc_time_zone": "+10:00"
  },
  {
    "timezone": "Australia/LHI",
    "utc_time_zone": "+10:30"
  },
  {
    "timezone": "Australia/Lord_Howe",
    "utc_time_zone": "+10:30"
  },
  {
    "timezone": "Asia/Magadan",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Asia/Sakhalin",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Asia/Srednekolymsk",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Etc/GMT-11",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Bougainville",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Efate",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Guadalcanal",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Kosrae",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Norfolk",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Noumea",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Pohnpei",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Pacific/Ponape",
    "utc_time_zone": "+11:00"
  },
  {
    "timezone": "Antarctica/McMurdo",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Antarctica/South_Pole",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Asia/Anadyr",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Asia/Kamchatka",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Etc/GMT-12",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Kwajalein",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "NZ",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Auckland",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Fiji",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Funafuti",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Kwajalein",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Majuro",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Nauru",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Tarawa",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Wake",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "Pacific/Wallis",
    "utc_time_zone": "+12:00"
  },
  {
    "timezone": "NZ-CHAT",
    "utc_time_zone": "+12:45"
  },
  {
    "timezone": "Pacific/Chatham",
    "utc_time_zone": "+12:45"
  },
  {
    "timezone": "Etc/GMT-13",
    "utc_time_zone": "+13:00"
  },
  {
    "timezone": "Pacific/Apia",
    "utc_time_zone": "+13:00"
  },
  {
    "timezone": "Pacific/Enderbury",
    "utc_time_zone": "+13:00"
  },
  {
    "timezone": "Pacific/Fakaofo",
    "utc_time_zone": "+13:00"
  },
  {
    "timezone": "Pacific/Kanton",
    "utc_time_zone": "+13:00"
  },
  {
    "timezone": "Pacific/Tongatapu",
    "utc_time_zone": "+13:00"
  },
  {
    "timezone": "Etc/GMT-14",
    "utc_time_zone": "+14:00"
  },
  {
    "timezone": "Pacific/Kiritimati",
    "utc_time_zone": "+14:00"
  },
  {
    "timezone": "America/Godthab",
    "utc_time_zone": "-01:00"
  },
  {
    "timezone": "America/Nuuk",
    "utc_time_zone": "-01:00"
  },
  {
    "timezone": "America/Scoresbysund",
    "utc_time_zone": "-01:00"
  },
  {
    "timezone": "Atlantic/Cape_Verde",
    "utc_time_zone": "-01:00"
  },
  {
    "timezone": "Etc/GMT+1",
    "utc_time_zone": "-01:00"
  },
  {
    "timezone": "America/Miquelon",
    "utc_time_zone": "-02:00"
  },
  {
    "timezone": "America/Noronha",
    "utc_time_zone": "-02:00"
  },
  {
    "timezone": "Atlantic/South_Georgia",
    "utc_time_zone": "-02:00"
  },
  {
    "timezone": "Brazil/DeNoronha",
    "utc_time_zone": "-02:00"
  },
  {
    "timezone": "Etc/GMT+2",
    "utc_time_zone": "-02:00"
  },
  {
    "timezone": "America/St_Johns",
    "utc_time_zone": "-02:30"
  },
  {
    "timezone": "Canada/Newfoundland",
    "utc_time_zone": "-02:30"
  },
  {
    "timezone": "America/Araguaina",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Buenos_Aires",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Catamarca",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/ComodRivadavia",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Cordoba",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Jujuy",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/La_Rioja",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Mendoza",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Rio_Gallegos",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Salta",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/San_Juan",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/San_Luis",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Tucuman",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Argentina/Ushuaia",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Asuncion",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Bahia",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Belem",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Buenos_Aires",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Catamarca",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Cayenne",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Cordoba",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Coyhaique",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Fortaleza",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Glace_Bay",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Goose_Bay",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Halifax",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Jujuy",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Maceio",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Mendoza",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Moncton",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Montevideo",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Paramaribo",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Punta_Arenas",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Recife",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Rosario",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Santarem",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Sao_Paulo",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Thule",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Antarctica/Palmer",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Antarctica/Rothera",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Atlantic/Bermuda",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Atlantic/Stanley",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Brazil/East",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Canada/Atlantic",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "Etc/GMT+3",
    "utc_time_zone": "-03:00"
  },
  {
    "timezone": "America/Anguilla",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Antigua",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Aruba",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Barbados",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Blanc-Sablon",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Boa_Vista",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Campo_Grande",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Caracas",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Cuiaba",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Curacao",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Detroit",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Dominica",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Fort_Wayne",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Grand_Turk",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Grenada",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Guadeloupe",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Guyana",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Havana",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indiana/Indianapolis",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indiana/Marengo",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indiana/Petersburg",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indiana/Vevay",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indiana/Vincennes",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indiana/Winamac",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Indianapolis",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Iqaluit",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Kentucky/Louisville",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Kentucky/Monticello",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Kralendijk",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/La_Paz",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Louisville",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Lower_Princes",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Manaus",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Marigot",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Martinique",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Montreal",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Montserrat",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Nassau",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/New_York",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Nipigon",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Pangnirtung",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Port-au-Prince",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Port_of_Spain",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Porto_Velho",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Puerto_Rico",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Santiago",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Santo_Domingo",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/St_Barthelemy",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/St_Kitts",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/St_Lucia",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/St_Thomas",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/St_Vincent",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Thunder_Bay",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Toronto",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Tortola",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Virgin",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "Brazil/West",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "Canada/Eastern",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "Chile/Continental",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "Cuba",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "EST5EDT",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "Etc/GMT+4",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "US/East-Indiana",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "US/Eastern",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "US/Michigan",
    "utc_time_zone": "-04:00"
  },
  {
    "timezone": "America/Atikokan",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Bogota",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Cancun",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Cayman",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Chicago",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Coral_Harbour",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Eirunepe",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Guayaquil",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Indiana/Knox",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Indiana/Tell_City",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Jamaica",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Knox_IN",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Lima",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Matamoros",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Menominee",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/North_Dakota/Beulah",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/North_Dakota/Center",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/North_Dakota/New_Salem",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Ojinaga",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Panama",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Porto_Acre",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Rainy_River",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Rankin_Inlet",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Resolute",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Rio_Branco",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Winnipeg",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "Brazil/Acre",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "CST6CDT",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "Canada/Central",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "EST",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "Etc/GMT+5",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "Jamaica",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "US/Central",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "US/Indiana-Starke",
    "utc_time_zone": "-05:00"
  },
  {
    "timezone": "America/Bahia_Banderas",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Belize",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Boise",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Cambridge_Bay",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Chihuahua",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Ciudad_Juarez",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Costa_Rica",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Denver",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Edmonton",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/El_Salvador",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Guatemala",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Inuvik",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Managua",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Merida",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Mexico_City",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Monterrey",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Regina",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Shiprock",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Swift_Current",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Tegucigalpa",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Yellowknife",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Canada/Mountain",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Canada/Saskatchewan",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Chile/EasterIsland",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Etc/GMT+6",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "MST7MDT",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Mexico/General",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Navajo",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Pacific/Easter",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "Pacific/Galapagos",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "US/Mountain",
    "utc_time_zone": "-06:00"
  },
  {
    "timezone": "America/Creston",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Dawson",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Dawson_Creek",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Ensenada",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Fort_Nelson",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Hermosillo",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Los_Angeles",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Mazatlan",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Phoenix",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Santa_Isabel",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Tijuana",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Vancouver",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Whitehorse",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "Canada/Pacific",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "Canada/Yukon",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "Etc/GMT+7",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "MST",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "Mexico/BajaNorte",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "Mexico/BajaSur",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "PST8PDT",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "US/Arizona",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "US/Pacific",
    "utc_time_zone": "-07:00"
  },
  {
    "timezone": "America/Anchorage",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "America/Juneau",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "America/Metlakatla",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "America/Nome",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "America/Sitka",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "America/Yakutat",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "Etc/GMT+8",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "Pacific/Pitcairn",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "US/Alaska",
    "utc_time_zone": "-08:00"
  },
  {
    "timezone": "America/Adak",
    "utc_time_zone": "-09:00"
  },
  {
    "timezone": "America/Atka",
    "utc_time_zone": "-09:00"
  },
  {
    "timezone": "Etc/GMT+9",
    "utc_time_zone": "-09:00"
  },
  {
    "timezone": "Pacific/Gambier",
    "utc_time_zone": "-09:00"
  },
  {
    "timezone": "US/Aleutian",
    "utc_time_zone": "-09:00"
  },
  {
    "timezone": "Pacific/Marquesas",
    "utc_time_zone": "-09:30"
  },
  {
    "timezone": "Etc/GMT+10",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "HST",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "Pacific/Honolulu",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "Pacific/Johnston",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "Pacific/Rarotonga",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "Pacific/Tahiti",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "US/Hawaii",
    "utc_time_zone": "-10:00"
  },
  {
    "timezone": "Etc/GMT+11",
    "utc_time_zone": "-11:00"
  },
  {
    "timezone": "Pacific/Midway",
    "utc_time_zone": "-11:00"
  },
  {
    "timezone": "Pacific/Niue",
    "utc_time_zone": "-11:00"
  },
  {
    "timezone": "Pacific/Pago_Pago",
    "utc_time_zone": "-11:00"
  },
  {
    "timezone": "Pacific/Samoa",
    "utc_time_zone": "-11:00"
  },
  {
    "timezone": "US/Samoa",
    "utc_time_zone": "-11:00"
  },
  {
    "timezone": "Etc/GMT+12",
    "utc_time_zone": "-12:00"
  }
];





const ZoneRegistrationModal = ({ show, onHide, myTimeZone, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myTimeZone) {
      setFormData({
        location_id: myTimeZone.location_id || "",
        utc_time_zone: myTimeZone.utc_time_zone || "",
      });
    }
  }, [myTimeZone]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setLocations(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (show && user?.tenantToken) {
      fetchLocations();
    }
  }, [show, user?.tenantToken]);

  useEffect(() => {
    if (!show) {
      setFormData({
        location_id: "",
        utc_time_zone: "",
      });
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // react-select expects options as { value, label }
const timezoneOptions = TIMEZONES.map((tz) => ({
  value: tz.timezone, // Use the unique timezone name
  label: `${tz.timezone} (UTC${tz.utc_time_zone})`,
}));


// When setting formData
const [formData, setFormData] = useState({
  location_id: "",
  timezone: "", // use 'timezone' instead of 'utc_time_zone'
});

// When selecting
const selectedTimezoneOption = timezoneOptions.find(
  (opt) => opt.value === formData.timezone
);

const handleTimezoneChange = (selectedOption) => {
  setFormData((prev) => ({
    ...prev,
    timezone: selectedOption ? selectedOption.value : "",
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.tenantToken)
        throw new Error("Authorization token is missing.");

      const url = myTimeZone
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/update/time/zone/${myTimeZone.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/create/time/zone`;

      const method = "POST";

      // Only send location_id and utc_time_zone
     // Find the selected timezone object
    const selectedTz = TIMEZONES.find(tz => tz.timezone === formData.timezone);

    const payload = {
      location_id: formData.location_id,
      utc_time_zone: selectedTz ? selectedTz.utc_time_zone : "",
    };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          myTimeZone
            ? "Time Zone updated successfully!"
            : "Time Zone added successfully!"
        );
        setTimeout(() => {
          onSubmit();
          onHide();
        }, 1000);
      } else {
        let errorMsg = "An error occurred.";
        if (result?.errors) {
          errorMsg = Object.values(result.errors).flat().join("\n");
        } else if (result?.message) {
          errorMsg = result.message;
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("An error occurred. Contact Admin");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {myTimeZone ? "Time Zone" : "Add Time Zone"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location</Form.Label>
            {myTimeZone ? (
              <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
              disabled
            >
              <option value="">Select a location</option>
              {Array.isArray(locations) &&
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} at {location.state} state
                  </option>
                ))}
            </Form.Select>
            ) : (
              
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a location</option>
              {Array.isArray(locations) &&
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} at {location.state} state
                  </option>
                ))}
            </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="timezone">
            <Form.Label>Time Zone</Form.Label>
            <Select
              options={timezoneOptions}
              value={selectedTimezoneOption || null}
              onChange={handleTimezoneChange}
              isClearable
              placeholder="Select or search timezone..."
              classNamePrefix="react-select"
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
            style={{
              backgroundColor: primary,
              borderColor: primary,
              color: "#fff",
            }}
          >
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : myTimeZone ? (
              "Update"
            ) : (
              "Add"
            )}{" "}
            Time Zone
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ZoneRegistrationModal;