
import { useState, useEffect, useCallback } from "react";
import { Guest } from "@/components/guest/GuestSelectionModal";

export function useGuestSession() {
  const [guestData, setGuestData] = useState<Guest | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
    setIsLoading(false);
  }, []);
  
  // Using useCallback to avoid unnecessary recreation of the function
  const promptGuestSelection = useCallback(() => {
    setShowGuestModal(true);
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
  
  return {
    guestData,
    showGuestModal,
    setGuestSession,
    clearGuestSession,
    promptGuestSelection,
    setShowGuestModal,
    isLoading
  };
}
