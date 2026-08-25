import { useEffect, useState } from "react";
import { getMyTickets, getTicketQr } from "../api/ticketApi";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [qrImages, setQrImages] = useState({});

  useEffect(() => { getMyTickets().then((response) => setTickets(response.data.items)).catch(() => setMessage("Please log in to view your tickets.")); }, []);
  const showQr = async (ticketId) => {
    try { const response = await getTicketQr(ticketId); setQrImages((current) => ({ ...current, [ticketId]: response.data.qrImage })); }
    catch { setMessage("The QR code could not be loaded."); }
  };

  return <div className="min-h-screen bg-slate-50"><section className="border-b bg-white"><div className="mx-auto max-w-5xl px-6 py-10"><p className="text-sm font-semibold uppercase text-slate-500">Account</p><h1 className="mt-2 text-4xl font-bold">My Tickets</h1></div></section><section className="mx-auto max-w-5xl space-y-6 px-6 py-10">
    {message && <p className="text-red-600">{message}</p>}{!message && tickets.length === 0 && <p className="text-slate-600">You do not have any tickets yet.</p>}
    {tickets.map((ticket) => <article key={ticket.id} className="grid overflow-hidden rounded-xl border bg-white shadow-sm md:grid-cols-[1fr_220px]"><div className="p-6"><p className="text-sm text-slate-500">Digital Ticket</p><h2 className="mt-1 text-2xl font-bold">{ticket.event_title}</h2><dl className="mt-6 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-slate-500">Ticket ID</dt><dd className="font-medium break-all">{ticket.id}</dd></div><div><dt className="text-sm text-slate-500">Status</dt><dd className="capitalize">{ticket.status}</dd></div></dl></div><div className="flex flex-col items-center justify-center border-t bg-slate-50 p-6 md:border-l md:border-t-0">{qrImages[ticket.id] ? <img src={qrImages[ticket.id]} alt={`QR code for ${ticket.event_title}`} className="h-36 w-36" /> : <button onClick={() => showQr(ticket.id)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Show QR code</button>}<p className="mt-3 text-xs text-slate-500">Scan at entry</p></div></article>)}
  </section></div>;
}

export default MyTickets;
