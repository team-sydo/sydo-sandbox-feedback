
import { useState, useEffect } from "react";
import { Guest } from "@/components/guest/GuestSelectionModal";

export function useGuestSession() {
  const [guestData, setGuestData] = useState<Guest | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  // Load guest data from localStorage on component mount
  useEffect(() => {
    const storedGuest = localStorage.getItem('guest_session');
    if (storedGuest) {
      try {
        setGuestData(JSON.parse(storedGuest));
      } catch (error) {
        console.error("Error parsing stored guest data:", error);
        localStorage.removeItem('guest_session');
      }
    }
  }, []);
  
  const setGuestSession = (guest: Guest) => {
    // Store guest data in localStorage
    localStorage.setItem('guest_session', JSON.stringify(guest));
    setGuestData(guest);
    setShowGuestModal(false);
  };
  
  const clearGuestSession = () => {
    localStorage.removeItem('guest_session');
    setGuestData(null);
  };
  
  const promptGuestSelection = () => {
    setShowGuestModal(true);
  };
  
  return {
    guestData,
    showGuestModal,
    setGuestSession,
    clearGuestSession,
    promptGuestSelection,
    setShowGuestModal
  };
}
