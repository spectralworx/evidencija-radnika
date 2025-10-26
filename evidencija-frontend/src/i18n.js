import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  sr: {
    translation: {
      // Login
      "appTitle": "Evidencija Radnika",
      "login": "Prijava",
      "logout": "Odjava", 
      "email": "Email",
      "password": "Lozinka",
      "loginBtn": "Prijavi se",
      "loginDesc": "Prijavite se na svoj nalog",
      "testAccount": "Test nalog",
      "loading": "Učitavam...",
      "loginError": "Greška pri prijavi",

      // Dashboard
      "dashboard": "Početna",
      "welcome": "Dobrodošli",
      "checkIn": "Dolazak",
      "checkOut": "Odlazak", 
      "break": "Pauza",
      "endBreak": "Završi pauzu",
      "checkInDesc": "Evidentiraj svoj dolazak na posao",
      "checkOutDesc": "Evidentiraj svoj odlazak sa posla",
      "breakDesc": "Evidentiraj pauzu tokom radnog vremena",
      "endBreakDesc": "Završi trenutnu pauzu",
      
      // Navigation
      "history": "Istorija",
      "vacationRequest": "Slobodni dani",
      "settings": "Podešavanja",
      "adminPanel": "Admin Panel",

      // Messages
      "checkingQr": "Proveravam QR kod...",
      "invalidQr": "Nevažeći QR kod!",
      "checkInSuccess": "Uspešno ste evidentirali dolazak!",
      "checkOutSuccess": "Uspešno ste evidentirali odlazak!",
      "breakStarted": "Pauza započeta!",
      "breakEnded": "Pauza završena!",
      "breakRecorded": "Pauza evidentirana!",
      "unknownAction": "Nepoznata akcija",
      "error": "Greška",
      "alreadyCheckedIn": "Već ste evidentirali dolazak",
      "noActiveAttendance": "Nema aktivnog dolaska",
      "checkInFirst": "Prvo evidentiraj dolazak",
      "checkedInSince": "Prijavljen od",
      "onBreakSince": "Na pauzi od",

      // QR Scanner
      "scanForCheckIn": "Skeniraj QR kod za dolazak",
      "scanForCheckOut": "Skeniraj QR kod za odlazak", 
      "scanForBreak": "Skeniraj QR kod za pauzu",
      "scanQrCode": "Skeniraj QR kod",
      "positionQrCode": "Postavite QR kod unutar okvira",
      "allowCameraAccess": "Dozvolite pristup kameri",
      "scanAutomatically": "Skeniranje je automatsko",
      "cancel": "Otkaži",
      "restartCamera": "Ponovo pokreni kameru",

      // History
      "recentActivity": "Nedavna aktivnost",
      "attendanceHistory": "Istorija dolazaka",
      "noHistory": "Nema zabeležene istorije",
      "arrival": "Dolazak",
      "departure": "Odlazak",
      "totalTime": "Ukupno vreme",
      "breakTime": "Vreme pauze", 
      "effectiveTime": "Efektivno vreme",
      "breaks": "Pauze",
      "inProgress": "U toku",
      "completed": "Završeno",
      "active": "Aktivan",

      // Vacation Requests
      "vacationRequests": "Zahtevi za slobodne dane",
      "newRequest": "Nov zahtev",
      "newVacationRequest": "Nov zahtev za odsustvo",
      "noVacationRequests": "Nema zahteva za odsustvo",
      "startDate": "Početni datum",
      "endDate": "Završni datum", 
      "notes": "Napomena",
      "vacationNotes": "Opišite razlog za odsustvo...",
      "submitRequest": "Pošalji zahtev",
      "vacationInfo": "Zahtev će biti prosleđen administratoru na odobrenje",
      "vacationRequestSent": "Zahtev za odsustvo je poslat!",
      "employeeNotes": "Napomena zaposlenog",
      "adminNotes": "Napomena administratora",
      "submitted": "Podneto",
      "pending": "Na čekanju",
      "approved": "Odobreno", 
      "rejected": "Odbijeno",

      // Settings
      "languageSetting": "Izaberite jezik aplikacije",
      "profileInfo": "Podaci o profilu",
      "name": "Ime i prezime",
      "role": "Uloga",
      "workplace": "Mesto rada",
      "phone": "Telefon",

      // Admin
      "adminDashboard": "Admin Dashboard",
      "totalUsers": "Ukupno korisnika",
      "admins": "Administratora", 
      "workers": "Radnika",
      "totalAttendance": "Ukupno dolazaka",
      "pendingRequests": "Zahteva na čekanju",
      "quickActions": "Brze akcije",
      "viewAttendance": "Pregled dolazaka",
      "manageVacations": "Upravljanje odsustvima",
      "attendanceManagement": "Upravljanje evidencijom",
      "allUsers": "Svi korisnika",
      "filter": "Filtriraj",
      "vacationManagement": "Upravljanje odsustvima",
      "enterNotes": "Unesite napomenu",
      "approve": "Odobri",
      "reject": "Odbij",

      // QR Code Page
      "qrCode": "QR Kod",
      "currentQrCode": "Trenutni QR kod", 
      "validUntil": "Važi do",
      "generated": "Generisan",
      "refresh": "Osveži",
      "printQr": "Štampaj QR",
      "howToUse": "Kako koristiti QR kod",
      "qrStep1": "Otvori aplikaciju na telefonu",
      "qrStep2": "Idi na sekciju za skeniranje",
      "qrStep3": "Skeniraj QR kod kamerom", 
      "qrStep4": "Potvrdi akciju",
      "qrInformation": "Informacije o QR kodu",
      "copyCode": "Kopiraj kod",
      "downloadQr": "Preuzmi QR",
      "qrCopied": "QR kod kopiran!",
      "noActiveQr": "Nema aktivnog QR koda",
      "qrWillGenerate": "QR kod će se automatski generisati u 08:00 ili 15:00",
      "generateNow": "Generiši sada",
      "qrSchedule": "Raspored QR kodova",
      "qrGeneratedAuto": "QR kodovi se automatski generišu",
      "morningQr": "Jutarnji QR kod",
      "afternoonQr": "Popodnevni QR kod",

      // NEW: Admin Tools
      "adminTools": "Admin Alati",
      "allAttendance": "Sva Evidencija", 
      "userManagement": "Upravljanje Korisnicima",
      "vacationManagement": "Upravljanje Odsustvima",
      "qrManagement": "QR Kodovi",
      "exportReport": "Generiši Izveštaj",
      "addUser": "Dodaj Korisnika",
      "editUser": "Izmeni Korisnika", 
      "deleteUser": "Obriši Korisnika",
      "userDetails": "Detalji Korisnika",
      "workplace": "Mesto Rada",
      "phone": "Telefon",
      "role": "Uloga",
      "employee": "Zaposleni",
      "administrator": "Administrator",

      // Misc
      "online": "Online",
      "sessionActive": "Sesija aktivna",
      "backToDashboard": "Nazad na dashboard"
    }
  },
  en: {
    translation: {
      // Login
      "appTitle": "Employee Attendance",
      "login": "Login",
      "logout": "Logout",
      "email": "Email", 
      "password": "Password",
      "loginBtn": "Login",
      "loginDesc": "Sign in to your account",
      "testAccount": "Test account",
      "loading": "Loading...",
      "loginError": "Login error",

      // Dashboard
      "dashboard": "Dashboard",
      "welcome": "Welcome",
      "checkIn": "Check In",
      "checkOut": "Check Out",
      "break": "Break",
      "endBreak": "End Break",
      "checkInDesc": "Record your arrival at work",
      "checkOutDesc": "Record your departure from work", 
      "breakDesc": "Record break during working hours",
      "endBreakDesc": "End current break",

      // Navigation
      "history": "History",
      "vacationRequest": "Vacation Days",
      "settings": "Settings",
      "adminPanel": "Admin Panel",

      // Messages
      "checkingQr": "Checking QR code...",
      "invalidQr": "Invalid QR code!",
      "checkInSuccess": "Successfully recorded check-in!",
      "checkOutSuccess": "Successfully recorded check-out!",
      "breakStarted": "Break started!",
      "breakEnded": "Break ended!",
      "breakRecorded": "Break recorded!",
      "unknownAction": "Unknown action",
      "error": "Error",
      "alreadyCheckedIn": "You are already checked in",
      "noActiveAttendance": "No active attendance", 
      "checkInFirst": "Check in first",
      "checkedInSince": "Checked in since",
      "onBreakSince": "On break since",

      // QR Scanner
      "scanForCheckIn": "Scan QR code for check-in",
      "scanForCheckOut": "Scan QR code for check-out",
      "scanForBreak": "Scan QR code for break",
      "scanQrCode": "Scan QR code",
      "positionQrCode": "Position QR code within the frame",
      "allowCameraAccess": "Allow camera access",
      "scanAutomatically": "Scanning is automatic", 
      "cancel": "Cancel",
      "restartCamera": "Restart camera",

      // History
      "recentActivity": "Recent activity",
      "attendanceHistory": "Attendance history",
      "noHistory": "No history recorded",
      "arrival": "Arrival",
      "departure": "Departure",
      "totalTime": "Total time",
      "breakTime": "Break time",
      "effectiveTime": "Effective time",
      "breaks": "Breaks",
      "inProgress": "In progress",
      "completed": "Completed",
      "active": "Active",

      // Vacation Requests
      "vacationRequests": "Vacation Requests",
      "newRequest": "New Request",
      "newVacationRequest": "New Vacation Request", 
      "noVacationRequests": "No vacation requests",
      "startDate": "Start date",
      "endDate": "End date",
      "notes": "Notes",
      "vacationNotes": "Describe reason for absence...",
      "submitRequest": "Submit request",
      "vacationInfo": "Request will be forwarded to administrator for approval",
      "vacationRequestSent": "Vacation request sent!",
      "employeeNotes": "Employee notes",
      "adminNotes": "Admin notes",
      "submitted": "Submitted",
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected",

      // Settings
      "languageSetting": "Choose application language",
      "profileInfo": "Profile information",
      "name": "Full name",
      "role": "Role", 
      "workplace": "Workplace",
      "phone": "Phone",

      // Admin
      "adminDashboard": "Admin Dashboard",
      "totalUsers": "Total Users",
      "admins": "Admins",
      "workers": "Workers",
      "totalAttendance": "Total Attendance",
      "pendingRequests": "Pending Requests",
      "quickActions": "Quick Actions",
      "viewAttendance": "View Attendance",
      "manageVacations": "Manage Vacations", 
      "attendanceManagement": "Attendance Management",
      "allUsers": "All Users",
      "filter": "Filter",
      "vacationManagement": "Vacation Management",
      "enterNotes": "Enter notes",
      "approve": "Approve",
      "reject": "Reject",

      // QR Code Page
      "qrCode": "QR Code",
      "currentQrCode": "Current QR Code",
      "validUntil": "Valid Until",
      "generated": "Generated",
      "refresh": "Refresh",
      "printQr": "Print QR",
      "howToUse": "How to use QR code",
      "qrStep1": "Open the app on your phone",
      "qrStep2": "Go to the scanning section",
      "qrStep3": "Scan the QR code with camera",
      "qrStep4": "Confirm the action", 
      "qrInformation": "QR Code Information",
      "copyCode": "Copy Code",
      "downloadQr": "Download QR",
      "qrCopied": "QR code copied!",
      "noActiveQr": "No active QR code",
      "qrWillGenerate": "QR code will be generated automatically at 08:00 or 15:00",
      "generateNow": "Generate Now",
      "qrSchedule": "QR Code Schedule",
      "qrGeneratedAuto": "QR codes are generated automatically",
      "morningQr": "Morning QR Code",
      "afternoonQr": "Afternoon QR Code",

      // NEW: Admin Tools
      "adminTools": "Admin Tools",
      "allAttendance": "All Attendance",
      "userManagement": "User Management", 
      "vacationManagement": "Vacation Management",
      "qrManagement": "QR Codes",
      "exportReport": "Generate Report",
      "addUser": "Add User",
      "editUser": "Edit User",
      "deleteUser": "Delete User",
      "userDetails": "User Details",
      "workplace": "Workplace",
      "phone": "Phone",
      "role": "Role", 
      "employee": "Employee",
      "administrator": "Administrator",

      // Misc
      "online": "Online",
      "sessionActive": "Session active", 
      "backToDashboard": "Back to Dashboard"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'sr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;