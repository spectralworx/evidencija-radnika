const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();

console.log('🚀 Backend starting with CORS enabled...');

// CORS middleware - OVAJ ĆE RADITI SIGURNO
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://evidencija-radnika.vercel.app',
    'https://evidencija-frontend.vercel.app', 
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🛫 Preflight request handled for:', origin);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const PORT = process.env.PORT || 5000;

// Generisanje QR koda
const generateQRCode = async () => {
  try {
    const kod = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const vreme_generisanja = new Date().toISOString();
    
    const now = new Date();
    let vazeci_do;

    const hoursInSerbia = now.toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade', hour: '2-digit' });
    const currentHour = parseInt(hoursInSerbia);

    console.log(`🕐 Trenutno vreme u Srbiji: ${currentHour}:00`);

    if (currentHour < 15) {
      vazeci_do = new Date(now);
      vazeci_do.setHours(15, 0, 0, 0);
      console.log('🕗 Generisan JUTRANJI QR kod - važi do 15:00');
    } else {
      vazeci_do = new Date(now);
      vazeci_do.setDate(vazeci_do.getDate() + 1);
      vazeci_do.setHours(8, 0, 0, 0);
      console.log('🕒 Generisan POPODNEVNI QR kod - važi do 08:00 sledećeg dana');
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .insert([{ 
        kod, 
        vreme_generisanja, 
        vazeci_do: vazeci_do.toISOString()
      }])
      .select();

    if (error) throw error;

    console.log('🎯 Novi QR kod generisan:', kod);
    
    const qr_image = await QRCode.toDataURL(kod, { width: 400, margin: 2 });
    
    return {
      ...data[0],
      qr_image: qr_image
    };
  } catch (error) {
    console.error('❌ Greška pri generisanju QR koda:', error);
    throw error;
  }
};

// Test rute
app.get('/', (req, res) => {
  res.json({ message: 'Backend radi! 🚀', timestamp: new Date().toISOString() });
});

app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) throw error;
    res.json({ message: 'Baza radi!', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kreiraj test korisnike
app.get('/create-test-users', async (req, res) => {
  try {
    const users = [
      {
        ime: 'Admin',
        prezime: 'Korisnik', 
        email: 'admin@company.com',
        telefon: '123-456',
        mesto_rada: 'Glavna kancelarija',
        role: 'admin'
      },
      {
        ime: 'Marko',
        prezime: 'Radnik',
        email: 'marko@company.com', 
        telefon: '123-457',
        mesto_rada: 'Prodaja',
        role: 'radnik'
      },
      {
        ime: 'Ana',
        prezime: 'Radnik',
        email: 'ana@company.com',
        telefon: '123-458',
        mesto_rada: 'Marketing',
        role: 'radnik'
      }
    ];

    const createdUsers = [];
    for (const user of users) {
      const { data: exists } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!exists) {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([user])
          .select();
        
        if (error) throw error;
        createdUsers.push(newUser[0]);
      } else {
        createdUsers.push(exists);
      }
    }

    res.json({ 
      success: true, 
      message: 'Test korisnici kreirani!',
      users: createdUsers,
      login: {
        admin: { email: 'admin@company.com', password: 'admin123' },
        radnik: { email: 'marko@company.com', password: 'marko123' }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login pokušaj za:', email);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('❌ Korisnik nije pronađen:', email);
      return res.status(401).json({ success: false, error: 'Korisnik nije pronađen' });
    }

    if (password && password.length >= 3) {
      console.log('✅ Uspešan login za:', email);
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          ime: user.ime, 
          prezime: user.prezime,
          role: user.role,
          mesto_rada: user.mesto_rada,
          telefon: user.telefon
        }
      });
    } else {
      console.log('❌ Pogrešna lozinka za:', email);
      res.status(401).json({ success: false, error: 'Pogrešna lozinka' });
    }
  } catch (error) {
    console.error('❌ Greška pri login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Svi korisnici
app.get('/all-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('ime', { ascending: true });

    if (error) throw error;
    res.json({ success: true, users: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kreiraj korisnika
app.post('/create-user', async (req, res) => {
  try {
    const { ime, prezime, email, telefon, mesto_rada, role } = req.body;
    
    const { data: exists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (exists) {
      return res.status(400).json({ success: false, error: 'Korisnik sa ovim email-om već postoji' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        ime, 
        prezime, 
        email, 
        telefon, 
        mesto_rada, 
        role: role || 'radnik' 
      }])
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Korisnik uspešno kreiran!',
      user: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generiši novi QR kod (ručno) - DODATA RUTA
app.post('/generate-qr', async (req, res) => {
  try {
    console.log('🔄 Ručno generisanje QR koda...');
    const qrCode = await generateQRCode();
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error('❌ Greška pri generisanju QR koda:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trenutni QR kod - generiše se automatski ako ne postoji
app.get('/current-qr', async (req, res) => {
  try {
    console.log('🔍 Tražim aktivan QR kod...');
    
    let { data: activeQr, error } = await supabase
      .from('qr_codes')
      .select('*')
      .gt('vazeci_do', new Date().toISOString())
      .order('vreme_generisanja', { ascending: false })
      .limit(1)
      .single();

    if (!activeQr) {
      console.log('🔄 Nema aktivnog QR koda - generišem novi...');
      activeQr = await generateQRCode();
    } else {
      console.log('✅ Koristim postojeći QR kod');
      const qr_image = await QRCode.toDataURL(activeQr.kod, { width: 400, margin: 2 });
      activeQr.qr_image = qr_image;
    }

    res.json({ 
      success: true, 
      qrCode: activeQr
    });
  } catch (error) {
    console.error('❌ Greška pri učitavanju QR koda:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generiši QR kod odmah
app.post('/generate-qr-now', async (req, res) => {
  try {
    const qrCode = await generateQRCode();
    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validacija QR koda
app.post('/validate-qr', async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('kod', qrCode)
      .gt('vazeci_do', new Date().toISOString())
      .single();

    if (error || !data) {
      return res.json({ valid: false, error: 'QR kod nije validan ili je istekao' });
    }

    res.json({ valid: true, qrData: data });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

// DOLASCI/ODLASCI
app.post('/check-in', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const { data, error } = await supabase
      .from('dolasci')
      .insert([{ 
        user_id,
        timestamp_dolaska: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Dolazak uspešno evidentiran!',
      dolazak: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/check-out', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const { data: activeAttendance, error: findError } = await supabase
      .from('dolasci')
      .select('*')
      .eq('user_id', user_id)
      .is('timestamp_odlaska', null)
      .order('timestamp_dolaska', { ascending: false })
      .limit(1)
      .single();

    if (findError || !activeAttendance) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nema aktivnog dolaska za ovog korisnika' 
      });
    }

    const timestamp_odlaska = new Date().toISOString();
    const dolazak = new Date(activeAttendance.timestamp_dolaska);
    const odlazak = new Date(timestamp_odlaska);
    const ukupno_vreme = (odlazak - dolazak) / (1000 * 60 * 60);

    const { data, error } = await supabase
      .from('dolasci')
      .update({ 
        timestamp_odlaska,
        ukupno_vreme: `${ukupno_vreme.toFixed(2)} hours`
      })
      .eq('id', activeAttendance.id)
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Odlazak uspešno evidentiran!',
      dolazak: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PAUZE
app.post('/start-break', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const { data: activeAttendance, error: findError } = await supabase
      .from('dolasci')
      .select('*')
      .eq('user_id', user_id)
      .is('timestamp_odlaska', null)
      .order('timestamp_dolaska', { ascending: false })
      .limit(1)
      .single();

    if (findError || !activeAttendance) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nema aktivnog dolaska za ovog korisnika' 
      });
    }

    const { data, error } = await supabase
      .from('pauze')
      .insert([{ 
        dolazak_id: activeAttendance.id,
        pocetak: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Pauza započeta!',
      pauza: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ispravljena ruta za završetak pauze
app.post('/end-break', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    console.log('🔚 Završetak pauze za korisnika:', user_id);
    
    // Pronađi aktivni dolazak
    const { data: activeAttendance, error: findError } = await supabase
      .from('dolasci')
      .select('*')
      .eq('user_id', user_id)
      .is('timestamp_odlaska', null)
      .order('timestamp_dolaska', { ascending: false })
      .limit(1)
      .single();

    if (findError || !activeAttendance) {
      console.log('❌ Nema aktivnog dolaska za korisnika:', user_id);
      return res.status(400).json({ 
        success: false, 
        error: 'Nema aktivnog dolaska za ovog korisnika' 
      });
    }

    // Pronađi aktivnu pauzu
    const { data: activeBreak, error: breakError } = await supabase
      .from('pauze')
      .select('*')
      .eq('dolazak_id', activeAttendance.id)
      .is('kraj', null)
      .order('pocetak', { ascending: false })
      .limit(1)
      .single();

    if (breakError || !activeBreak) {
      console.log('❌ Nema aktivne pauze za dolazak:', activeAttendance.id);
      return res.status(400).json({ 
        success: false, 
        error: 'Nema aktivne pauze' 
      });
    }

    const kraj = new Date().toISOString();
    
    console.log('✅ Završavam pauzu:', activeBreak.id);
    
    // Ažuriraj pauzu
    const { data, error } = await supabase
      .from('pauze')
      .update({ 
        kraj
      })
      .eq('id', activeBreak.id)
      .select();

    if (error) throw error;

    console.log('✅ Pauza uspešno završena');
    
    res.json({ 
      success: true, 
      message: 'Pauza završena!',
      pauza: data[0]
    });
  } catch (error) {
    console.error('❌ Greška pri završetku pauze:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Istorija dolazaka
app.get('/attendance-history/:user_id?', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    let query = supabase
      .from('dolasci')
      .select(`
        *,
        user:users(ime, prezime, email, mesto_rada),
        pauze(*)
      `)
      .order('timestamp_dolaska', { ascending: false });

    if (user_id && user_id !== 'all') {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const historyWithCalculations = data.map(record => {
      let ukupno_pauza_sati = 0;
      
      if (record.pauze && record.pauze.length > 0) {
        record.pauze.forEach(pauza => {
          if (pauza.kraj) {
            const pocetak = new Date(pauza.pocetak);
            const kraj = new Date(pauza.kraj);
            ukupno_pauza_sati += (kraj - pocetak) / (1000 * 60 * 60);
          }
        });
      }

      let ukupno_vreme_sati = 0;
      if (record.timestamp_odlaska) {
        const dolazak = new Date(record.timestamp_dolaska);
        const odlazak = new Date(record.timestamp_odlaska);
        ukupno_vreme_sati = (odlazak - dolazak) / (1000 * 60 * 60);
      }

      const efektivno_vreme_sati = Math.max(0, ukupno_vreme_sati - ukupno_pauza_sati);

      return {
        ...record,
        ukupno_pauza_sati: ukupno_pauza_sati.toFixed(2),
        ukupno_vreme_sati: ukupno_vreme_sati.toFixed(2),
        efektivno_vreme_sati: efektivno_vreme_sati.toFixed(2)
      };
    });

    res.json({ success: true, history: historyWithCalculations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Zahtevi za odsustvo
app.get('/vacation-requests/:user_id?', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    let query = supabase
      .from('slobodni_dani')
      .select(`
        *,
        user:users(ime, prezime, email, mesto_rada)
      `)
      .order('created_at', { ascending: false });

    if (user_id && user_id !== 'all') {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, requests: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Kreiraj zahtev za odsustvo
app.post('/vacation-request', async (req, res) => {
  try {
    const { user_id, pocetak, kraj, napomena_radnika } = req.body;
    
    const { data, error } = await supabase
      .from('slobodni_dani')
      .insert([{ 
        user_id, 
        pocetak, 
        kraj, 
        napomena_radnika,
        status: 'ceka'
      }])
      .select(`
        *,
        user:users(ime, prezime, email, mesto_rada)
      `);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Zahtev za odsustvo je poslat!',
      request: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ažuriraj status zahteva
app.put('/vacation-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, napomena_admina } = req.body;
    
    const { data, error } = await supabase
      .from('slobodni_dani')
      .update({ 
        status,
        napomena_admina
      })
      .eq('id', id)
      .select(`
        *,
        user:users(ime, prezime, email, mesto_rada)
      `);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Status zahteva je ažuriran!',
      request: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// STATISTIKE ZA ADMIN PANEL
app.get('/admin/statistics', async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    const { data: attendance, error: attendanceError } = await supabase
      .from('dolasci')
      .select('*');

    if (attendanceError) throw attendanceError;

    const { data: pendingRequests, error: requestsError } = await supabase
      .from('slobodni_dani')
      .select('*')
      .eq('status', 'ceka');

    if (requestsError) throw requestsError;

    const statistics = {
      total_users: users.length,
      total_admins: users.filter(u => u.role === 'admin').length,
      total_workers: users.filter(u => u.role === 'radnik').length,
      total_attendance: attendance.length,
      pending_vacation_requests: pendingRequests.length
    };

    res.json({ success: true, statistics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ažuriraj korisnika
app.put('/update-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ime, prezime, telefon, mesto_rada, role } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        ime,
        prezime, 
        telefon,
        mesto_rada,
        role
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Korisnik uspešno ažuriran!',
      user: data[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for Vercel frontend`);
  
  setTimeout(async () => {
    try {
      const { data } = await supabase
        .from('qr_codes')
        .select('*')
        .gt('vazeci_do', new Date().toISOString())
        .limit(1);
      
      if (!data || data.length === 0) {
        console.log('🔐 Generišem početni QR kod...');
        await generateQRCode();
      }
    } catch (error) {
      console.log('Note:', error.message);
    }
  }, 1000);
});