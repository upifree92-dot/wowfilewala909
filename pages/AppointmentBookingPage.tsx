import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { saveAppointment } from '../lib/db';
import BackButton from '../components/BackButton';
import { 
  User, 
  Mail, 
  Phone, 
  Smartphone, 
  Wrench, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  CheckCircle, 
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const AppointmentBookingPage = () => {
  useSEO('Book Appointment', 'Book an appointment for device repair or service.');
  const { siteContent, user, setNotification } = useAppContext();
  const whatsappNumber = siteContent?.whatsapp?.phoneNumber || '919000000000';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  // Form states
  const [name, setName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.mobileNumber || '');
  const [deviceModel, setDeviceModel] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('Device Flashing & Unlock');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('12:00 PM');
  const [description, setDescription] = useState('');

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const submissionData = {
      name,
      email,
      phone,
      device_model: deviceModel,
      service_needed: serviceNeeded,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      description,
      user_id: user?.id || 'anonymous'
    };

    try {
      const result = await saveAppointment(submissionData);
      if (result.success) {
        setSubmitSuccess(true);
        setSubmittedData(result.data?.[0] || submissionData);
        setNotification('Inquiry submitted successfully! It is stored in the database.', 'success');
      } else {
        throw new Error('Could not submit inquiry');
      }
    } catch (err: any) {
      console.warn('Inquiry submission warning:', err);
      // Fallback in case Supabase table is not created yet or fails
      setErrorMsg(err.message || 'Connection error. Please ensure the Supabase appointments table is created using the SQL editor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[70vh] flex flex-col justify-center animate-fade-in">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/60 text-center">
          <div className="inline-flex items-center justify-center bg-emerald-500/10 p-5 rounded-full text-emerald-500 mb-6">
            <CheckCircle className="h-14 w-14" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
            Inquiry Submitted!
          </h1>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
            Thank you, <span className="font-semibold text-slate-700 dark:text-slate-200">{name}</span>! Your technical support inquiry has been recorded successfully in our database.
          </p>

          <div className="my-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-2.5 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Inquiry Receipt Details</div>
            <div><span className="text-slate-400">Device Model:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{deviceModel}</span></div>
            <div><span className="text-slate-400">Service:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{serviceNeeded}</span></div>
            <div><span className="text-slate-400">Preferred Slot:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{appointmentDate} at {appointmentTime}</span></div>
            {description && (
              <div><span className="text-slate-400">Description:</span> <span className="italic text-slate-600 dark:text-slate-400">"{description}"</span></div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wide">Pending Review</span>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi, I just submitted an inquiry on NexGen Mobile Hub for ${encodeURIComponent(deviceModel)} - ${encodeURIComponent(serviceNeeded)}. Can you please assist me?`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Connect on WhatsApp for Instant Support</span>
            </a>

            <button
              onClick={() => {
                setSubmitSuccess(false);
                setDeviceModel('');
                setDescription('');
              }}
              className="w-full text-sm text-cyan-500 hover:text-cyan-600 font-bold py-2 transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[70vh]">
      <div className="mb-6 flex justify-between items-center">
        <BackButton />
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          WhatsApp Support
        </a>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/60">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-cyan-500/10 p-4 rounded-2xl text-cyan-500 mb-4">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
            Submit Support Inquiry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Fill out the form below to register your device issue. Your request will be directly logged into our secure database.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400">
            <p className="font-bold mb-1">Database Error:</p>
            <p>{errorMsg}</p>
            <p className="mt-2 text-[11px] opacity-80">
              Note: Make sure to copy the SQL query below and run it in your Supabase SQL Editor.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <User className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Mobile / WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Device Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Device Model
              </label>
              <div className="relative">
                <Smartphone className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  required
                  placeholder="e.g. Realme 9 Pro, iPhone 14"
                  className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Service Needed */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Service Needed
              </label>
              <div className="relative">
                <Wrench className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={serviceNeeded}
                  onChange={(e) => setServiceNeeded(e.target.value)}
                  className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white appearance-none"
                >
                  <option value="Device Flashing & Unlock">Device Flashing & Unlock</option>
                  <option value="IMEI Support / Repair">IMEI Support / Repair</option>
                  <option value="Activation & Registration">Activation & Registration</option>
                  <option value="Online File Access Help">Online File Access Help</option>
                  <option value="Other Technical Issue">Other Technical Issue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Preferred Date
              </label>
              <div className="relative">
                <CalendarIcon className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Preferred Time Slot
              </label>
              <div className="relative">
                <Clock className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white appearance-none"
                >
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Inquiry / Issue Details
            </label>
            <div className="relative">
              <FileText className="h-5 w-5 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Briefly describe your issue or the help you need (e.g. bootloop issue, needs unlock tool, file not downloading...)"
                className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-base shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Inquiry to Database</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;
