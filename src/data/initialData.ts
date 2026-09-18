import { Track, BookingRequest, UpcomingEvent, ArtistProfile } from '../types';

export const initialArtistProfile: ArtistProfile = {
  name: "BHARATH KANNAN",
  tagline: "PIANIST | COMPOSER | PERFORMER",
  quote: "Music is more than sound. It is an experience.",
  bioParagraph1: "Bharath Kannan is a Grade 7 pianist with 13 years of experience, specializing in piano performances and music composition. An alumnus of KM Music Conservatory and a certified music composer from A.R. Rahman Music Foundation, Chennai, he has been a finalist in Casio The Pianist – Seasons 1 & 2.",
  bioParagraph2: "He performs at weddings and events and also works as a part-time piano teacher.",
  fullBio: `Bharath Kannan is a professionally trained Grade 7 pianist, music composer, performer, and music educator with over 13 years of experience in the world of music. An alumnus of KM Music Conservatory and a certified music composer from the A.R. Rahman Music Foundation, Chennai, he has built a strong musical foundation through years of dedicated training, performance, and creative exploration.

Specializing in piano performances and music composition, Bharath has performed at a wide range of weddings, private celebrations, corporate gatherings, and live events, creating memorable musical experiences tailored to each occasion. He has also been a finalist in Casio The Pianist – Seasons 1 & 2, reflecting his dedication and ability as a performing pianist.

Beyond solo performances, Bharath is also a band musician and actively performs live shows, collaborating with fellow musicians and bringing an energetic and engaging experience to audiences. His versatility allows him to move comfortably between solo piano performances, live band shows, event performances, and music composition.

Alongside his performing career, Bharath works as a part-time music teacher, helping aspiring musicians develop their piano skills and musical understanding. With a passion for both performance and education, he continues to explore new musical possibilities while sharing his experience and love for music with audiences and students alike.`,
  // High quality matching imagery
  heroImage: "/hero-bg.jpg", // Bharath Kannan hero portrait
  portraitImage: "/bharath-portrait.jpg", // Bharath Kannan portrait
  stageImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=85", // Live concert hall stage with grand piano
  email: "management@bharathkannan.in",
  notificationEmail: "bharath23245@gmail.com",
  phone: "+91 (22) 6622-3737",
  managerName: "Julian Vance (Artist Representation)",
  instagram: "https://www.instagram.com/bharathk_0",
  spotify: "https://spotify.com/artist/bharathkannan",
  youtube: "https://youtube.com/@bharathkannan",
};

export const initialTracks: Track[] = [
  {
    id: "1",
    title: "Nocturne in D Minor",
    subtitle: "Solo Piano",
    category: "Classical / Solo Piano",
    duration: "4:32",
    durationSec: 272,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    releaseDate: "Oct 14, 2024",
    plays: 142800,
    bpm: 68,
    keySignature: "D Minor",
    isFeatured: true
  },
  {
    id: "2",
    title: "Whispers in the Void",
    subtitle: "Piano & Strings",
    category: "Contemporary Ambient",
    duration: "6:15",
    durationSec: 375,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    releaseDate: "Aug 29, 2024",
    plays: 98400,
    bpm: 72,
    keySignature: "E Minor",
    isFeatured: true
  },
  {
    id: "3",
    title: "Awakening",
    subtitle: "Orchestral Suite",
    category: "Cinematic Orchestral",
    duration: "5:45",
    durationSec: 345,
    coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=400&q=80",
    releaseDate: "Jun 18, 2024",
    plays: 231500,
    bpm: 84,
    keySignature: "A Minor",
    isFeatured: true
  },
  {
    id: "4",
    title: "Luminescence",
    subtitle: "Solo Piano & Cello",
    category: "Chamber Music",
    duration: "4:50",
    durationSec: 290,
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80",
    releaseDate: "Apr 02, 2024",
    plays: 87100,
    bpm: 64,
    keySignature: "F Major",
    isFeatured: false
  },
  {
    id: "5",
    title: "Solitude at Dusk",
    subtitle: "Piano Improvisation",
    category: "Solo Piano",
    duration: "3:40",
    durationSec: 220,
    coverUrl: "https://images.unsplash.com/photo-1520523839898-50712825e617?auto=format&fit=crop&w=400&q=80",
    releaseDate: "Feb 11, 2024",
    plays: 65200,
    bpm: 58,
    keySignature: "B Minor",
    isFeatured: false
  },
  {
    id: "6",
    title: "Elysium Concerto No. 1",
    subtitle: "Live in Vienna Philharmonic",
    category: "Live Concerto",
    duration: "8:12",
    durationSec: 492,
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80",
    releaseDate: "Nov 20, 2023",
    plays: 310400,
    bpm: 92,
    keySignature: "C Minor",
    isFeatured: false
  }
];

export const initialBookings: BookingRequest[] = [
  {
    id: "BK-101",
    client: "National Centre for the Performing Arts",
    eventType: "Guest Conductor",
    date: "Nov 12, 2024",
    rawDate: "2024-11-12",
    status: "Confirmed",
    venue: "NCPA Tata Theatre",
    location: "Mumbai, Maharashtra, India",
    email: "programming@ncpamumbai.com",
    phone: "+91 (22) 6622-3737",
    budget: "₹3,50,000",
    message: "Guest appearance leading the autumn chamber series with Rachmaninoff Concerto No. 2 and Thorne original compositions.",
    createdAt: "2024-10-02"
  },
  {
    id: "BK-102",
    client: "Delhi Symphony Society",
    eventType: "Score Composition",
    date: "Dec 05, 2024",
    rawDate: "2024-12-05",
    status: "Pending",
    venue: "Siri Fort Auditorium",
    location: "New Delhi, Delhi, India",
    email: "curator@delhisymphony.org",
    phone: "+91 (11) 2649-3370",
    budget: "₹5,00,000",
    message: "Bespoke 3-act orchestral prelude score for the upcoming winter gala season premiere.",
    createdAt: "2024-10-21"
  },
  {
    id: "BK-103",
    client: "Nita Mukesh Ambani Cultural Centre",
    eventType: "Solo Performance",
    date: "Jan 15, 2025",
    rawDate: "2025-01-15",
    status: "Confirmed",
    venue: "The Grand Theatre, NMACC",
    location: "BKC, Mumbai, Maharashtra, India",
    email: "events@nmaccindia.com",
    phone: "+91 (22) 3570-0000",
    budget: "₹4,20,000",
    message: "Private 90-minute evening acoustic recital on a 9-foot Steinway Model D for 60 invited patrons.",
    createdAt: "2024-10-28"
  },
  {
    id: "BK-104",
    client: "Madras Music Academy",
    eventType: "Live Performance",
    date: "Feb 22, 2025",
    rawDate: "2025-02-22",
    status: "Pending",
    venue: "TTK Auditorium, The Music Academy",
    location: "Chennai, Tamil Nadu, India",
    email: "bookings@musicacademymadras.in",
    phone: "+91 (44) 2811-2231",
    budget: "₹2,75,000",
    message: "Solo acoustic headlining night for the Contemporary Keyboards International Festival.",
    createdAt: "2024-11-01"
  },
  {
    id: "BK-105",
    client: "Bangalore Philharmonic & Prithvi Guild",
    eventType: "Studio Sessions",
    date: "Mar 10, 2025",
    rawDate: "2025-03-10",
    status: "Confirmed",
    venue: "Chowdiah Memorial Hall",
    location: "Bengaluru, Karnataka, India",
    email: "music@bangalorephilharmonic.in",
    phone: "+91 (80) 2344-5810",
    budget: "₹3,00,000",
    message: "Featured piano soloist tracking for psychological drama feature film original score.",
    createdAt: "2024-11-04"
  }
];

export const initialEvents: UpcomingEvent[] = [
  {
    id: "EV-01",
    title: "Symphony Gala",
    month: "NOV",
    day: "12",
    fullDate: "November 12, 2024",
    venue: "NCPA Tata Theatre",
    location: "Mumbai, Maharashtra",
    time: "8:00 PM IST",
    ticketUrl: "https://in.bookmyshow.com",
    status: "Upcoming"
  },
  {
    id: "EV-02",
    title: "National Opera Premiere",
    month: "DEC",
    day: "05",
    fullDate: "December 05, 2024",
    venue: "Siri Fort Auditorium",
    location: "New Delhi",
    time: "7:30 PM IST",
    ticketUrl: "https://in.bookmyshow.com",
    status: "Upcoming"
  },
  {
    id: "EV-03",
    title: "Winter Solstice Recital",
    month: "DEC",
    day: "21",
    fullDate: "December 21, 2024",
    venue: "The Grand Theatre, NMACC",
    location: "Mumbai, Maharashtra",
    time: "7:00 PM IST",
    ticketUrl: "https://nmacc.com",
    status: "Upcoming"
  },
  {
    id: "EV-04",
    title: "Chamber Tour Finale",
    month: "JAN",
    day: "28",
    fullDate: "January 28, 2025",
    venue: "The Music Academy",
    location: "Chennai, Tamil Nadu",
    time: "8:00 PM IST",
    ticketUrl: "https://musicacademymadras.in",
    status: "Upcoming"
  }
];
