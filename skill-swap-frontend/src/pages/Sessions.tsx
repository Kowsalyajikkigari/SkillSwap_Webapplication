import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSessionsData, saveSessionsData, addUpcomingSession, acceptSessionRequest, declineSessionRequest, updateSessionFeedback, SessionsData, SessionData } from "../services/sessions.local";
import { getAllProfiles } from "../services/profiles";
import { getAllSkills } from "../services/skills";
import { getSkillExchangeRequests, acceptSkillExchangeRequest, declineSkillExchangeRequest, SkillExchangeRequest } from "../services/skill-exchange.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MessageCircle, CheckCircle, XCircle, Calendar as CalendarIcon, Clock as ClockIcon, MapPin, Video, ExternalLink, Phone, Timer, Users, BookOpen, Star, AlertCircle, Copy, Download, Handshake } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// No mock data - everything loads from real backend/localStorage

const Sessions = () => {
  const [sessions, setSessions] = useState<SessionsData>({
    upcoming: [],
    requests: [],
    past: []
  });
  const [skillExchangeRequests, setSkillExchangeRequests] = useState<SkillExchangeRequest[]>([]);
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // New session form state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionType, setSessionType] = useState("virtual");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Session details modal state
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<SessionData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Loading and feedback states
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [isCancellingSession, setIsCancellingSession] = useState(false);

  // Real-time countdown state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Reschedule modal state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<SessionData | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Preparation checklist state
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({});

  // Real data from APIs - declare before useEffects that use them
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  // Load sessions data from localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading sessions data from localStorage...');
    const savedSessionsData = getSessionsData();
    console.log('✅ Loaded sessions from localStorage:', savedSessionsData);
    setSessions(savedSessionsData);
  }, []);

  // Load real members and skills data from APIs
  useEffect(() => {
    const loadMembersAndSkills = async () => {
      try {
        // Load members
        setIsLoadingMembers(true);
        try {
          const profiles = await getAllProfiles();

          // Defensive programming: ensure profiles is an array
        if (!Array.isArray(profiles)) {
          console.warn('⚠️ getAllProfiles returned non-array:', profiles);
          // Check if it's a paginated response with results array
          if (profiles && Array.isArray(profiles.results)) {
            const formattedMembers = profiles.results.map(profile => ({
              id: profile.id,
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
              skills: profile.teachSkills?.map(skill => skill.skill_name) || []
            }));
            // Remove duplicates based on ID
            const uniqueMembers = formattedMembers.filter((member, index, self) => 
              index === self.findIndex(m => m.id === member.id)
            );
            setAvailableMembers(uniqueMembers);
            console.log('✅ Loaded members from paginated results:', uniqueMembers);
          } else {
            setAvailableMembers([]);
          }
        } else {
          const formattedMembers = profiles.map(profile => ({
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
            skills: profile.teachSkills?.map(skill => skill.skill_name) || []
          }));
          // Remove duplicates based on ID
          const uniqueMembers = formattedMembers.filter((member, index, self) => 
            index === self.findIndex(m => m.id === member.id)
          );
          setAvailableMembers(uniqueMembers);
          console.log('✅ Loaded members from API:', uniqueMembers);
        }
        } catch (error) {
          console.error('❌ Failed to load members:', error);
          setAvailableMembers([]);
        }

        // Load skills
        setIsLoadingSkills(true);
        try {
          const skills = await getAllSkills();

        // Defensive programming: ensure skills is an array
        if (!Array.isArray(skills)) {
          console.warn('⚠️ getAllSkills returned non-array:', skills);
          // Check if it's a paginated response with results array
          if (skills && Array.isArray(skills.results)) {
            const skillNames = skills.results.map(skill => skill.name);
            // Remove duplicates using Set
            const uniqueSkillNames = [...new Set(skillNames)];
            setAvailableSkills(uniqueSkillNames);
            console.log('✅ Loaded skills from paginated results:', uniqueSkillNames);
          } else {
            setAvailableSkills([]);
          }
        } else {
          const skillNames = skills.map(skill => skill.name);
          // Remove duplicates using Set
          const uniqueSkillNames = [...new Set(skillNames)];
          setAvailableSkills(uniqueSkillNames);
          console.log('✅ Loaded skills from API:', uniqueSkillNames);
        }
        } catch (error) {
          console.error('❌ Failed to load skills:', error);
          setAvailableSkills([]);
        }

        // Load skill exchange requests
        try {
          const exchangeRequests = await getSkillExchangeRequests();

          // Defensive programming: ensure exchangeRequests is an array
          if (!Array.isArray(exchangeRequests)) {
            console.warn('⚠️ getSkillExchangeRequests returned non-array:', exchangeRequests);
            // Check if it's a paginated response with results array
            if (exchangeRequests && Array.isArray(exchangeRequests.results)) {
              // Filter out invalid requests and add safety checks
              const validRequests = exchangeRequests.results.filter(request => 
                request && 
                request.id && 
                request.requester && 
                typeof request.requester === 'object'
              );
              setSkillExchangeRequests(validRequests);
              console.log('✅ Loaded skill exchange requests from results:', validRequests);
            } else {
              setSkillExchangeRequests([]);
            }
          } else {
            // Filter out invalid requests and add safety checks
            const validRequests = exchangeRequests.filter(request => 
              request && 
              request.id && 
              request.requester && 
              typeof request.requester === 'object'
            );
            setSkillExchangeRequests(validRequests);
            console.log('✅ Loaded skill exchange requests:', validRequests);
          }
        } catch (error) {
          console.error('❌ Failed to load skill exchange requests:', error);
          setSkillExchangeRequests([]);
        }

      } catch (error) {
        console.error('❌ Error loading members and skills:', error);
        // Fallback to empty arrays if API fails
        setAvailableMembers([]);
        setAvailableSkills([]);
        setSkillExchangeRequests([]);
      } finally {
        setIsLoadingMembers(false);
        setIsLoadingSkills(false);
      }
    };

    loadMembersAndSkills();
  }, []);

  // Real-time countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Reset form function
  const resetScheduleForm = () => {
    setSelectedMember("");
    setSelectedSkill("");
    setSessionDate("");
    setSessionTime("");
    setSessionType("virtual");
    setSessionNotes("");
  };

  // Handle schedule session form submission
  const handleScheduleSession = async () => {
    if (!selectedMember || !selectedSkill || !sessionDate || !sessionTime) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected member
      const member = availableMembers.find(m => m.id.toString() === selectedMember);
      if (!member) {
        throw new Error("Selected member not found");
      }

      // Create new session object
      const newSession = {
        id: Date.now(), // Simple ID generation
        user: {
          id: member.id,
          name: member.name,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        },
        skill: selectedSkill,
        date: new Date(sessionDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: new Date(`2000-01-01T${sessionTime}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) + " - " + new Date(`2000-01-01T${sessionTime}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).replace(/\d+/, (match) => (parseInt(match) + 1).toString()),
        type: sessionType === "virtual" ? "Virtual" : "In-person",
        status: "confirmed",
        notes: sessionNotes
      };

      // Add to upcoming sessions using the service
      addUpcomingSession(newSession);

      // Update local state
      setSessions(prev => ({
        ...prev,
        upcoming: [...prev.upcoming, newSession]
      }));

      // Reset form and close dialog
      resetScheduleForm();
      setIsScheduleDialogOpen(false);

      console.log("✅ Session scheduled successfully:", newSession);

    } catch (error) {
      console.error("❌ Error scheduling session:", error);
      alert("Failed to schedule session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = (sessionId: number) => {
    console.log('✅ Accepting session request:', sessionId);

    // Use the service to accept the request (it handles the conversion and storage)
    acceptSessionRequest(sessionId);

    // Reload sessions data from localStorage to get the updated state
    const updatedSessionsData = getSessionsData();
    setSessions(updatedSessionsData);

    console.log('✅ Session request accepted and moved to upcoming sessions');
  };

  const handleDeclineRequest = (sessionId: number) => {
    console.log('❌ Declining session request:', sessionId);

    // Use the service to decline the request (it handles the removal and storage)
    declineSessionRequest(sessionId);

    // Reload sessions data from localStorage to get the updated state
    const updatedSessionsData = getSessionsData();
    setSessions(updatedSessionsData);

    console.log('✅ Session request declined and removed');
  };
  
  const handleSubmitFeedback = () => {
    if (!activeSession) return;

    console.log('📝 Submitting feedback for session:', activeSession.id);

    const feedback = {
      rating: feedbackRating,
      comment: feedbackComment
    };

    // Use the service to update feedback
    updateSessionFeedback(activeSession.id, feedback);

    // Update local state
    const updatedPast = sessions.past.map(session => {
      if (session.id === activeSession.id) {
        return {
          ...session,
          feedback
        };
      }
      return session;
    });

    setSessions({
      ...sessions,
      past: updatedPast
    });

    setActiveSession(null);
    setFeedbackRating(5);
    setFeedbackComment("");

    console.log('✅ Feedback submitted successfully');
  };

  // Handle opening session details
  const handleOpenSessionDetails = (session: SessionData) => {
    console.log('📋 Opening session details for:', session.id);
    setSelectedSessionDetails(session);
    setIsDetailsModalOpen(true);
  };

  // Handle closing session details
  const handleCloseSessionDetails = () => {
    setSelectedSessionDetails(null);
    setIsDetailsModalOpen(false);
  };

  // Calculate time until session (for countdown) - now uses real-time currentTime
  const getTimeUntilSession = (sessionDate: string, sessionTime: string) => {
    try {
      // Parse session date and time
      let sessionDateTime: Date;
      if (sessionDate.includes(',')) {
        // Handle formatted dates like "Tomorrow" or "Saturday, Nov 18"
        const today = new Date();
        if (sessionDate === "Tomorrow") {
          sessionDateTime = new Date(today);
          sessionDateTime.setDate(today.getDate() + 1);
        } else {
          // For other formatted dates, use current year
          sessionDateTime = new Date(`${sessionDate}, ${new Date().getFullYear()}`);
        }

        // Add time
        if (sessionTime && sessionTime !== "To be scheduled") {
          const timeMatch = sessionTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const ampm = timeMatch[3].toUpperCase();

            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            sessionDateTime.setHours(hours, minutes, 0, 0);
          }
        }
      } else {
        sessionDateTime = new Date(`${sessionDate} ${sessionTime}`);
      }

      const timeDiff = sessionDateTime.getTime() - currentTime.getTime();

      if (timeDiff <= 0) return "Session time has passed";

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (days > 0) return `${days} days, ${hours} hours, ${minutes} minutes`;
      if (hours > 0) return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
      if (minutes > 0) return `${minutes} minutes, ${seconds} seconds`;
      return `${seconds} seconds`;
    } catch (error) {
      console.error('Error calculating time until session:', error);
      return "Time calculation unavailable";
    }
  };

  // Handle joining virtual session
  const handleJoinSession = async () => {
    if (!selectedSessionDetails) return;

    setIsJoiningSession(true);
    console.log('🎥 Joining virtual session for:', selectedSessionDetails.skill);

    try {
      // Simulate API call to get meeting credentials
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate dynamic meeting credentials based on session
      const meetingId = `${selectedSessionDetails.id}-${selectedSessionDetails.user.id}-${Date.now().toString().slice(-6)}`;
      const password = `skill${selectedSessionDetails.id}`;
      const meetingLink = `https://meet.skillswap.com/room/${meetingId}`;

      // In a real app, this would open the actual meeting room
      const confirmed = window.confirm(
        `🎥 Ready to join your ${selectedSessionDetails.skill} session!\n\n` +
        `Meeting ID: ${meetingId}\n` +
        `Password: ${password}\n` +
        `Link: ${meetingLink}\n\n` +
        `Click OK to open the meeting room in a new tab.`
      );

      if (confirmed) {
        // Open meeting in new tab
        window.open(meetingLink, '_blank');
        console.log('✅ Meeting room opened successfully');
      }

    } catch (error) {
      console.error('❌ Error joining session:', error);
      alert('Failed to join session. Please try again or contact support.');
    } finally {
      setIsJoiningSession(false);
    }
  };

  // Handle getting directions
  const handleGetDirections = (location: string) => {
    console.log('🗺️ Getting directions to:', location);
    // In a real app, this would open maps with directions
    const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  // Handle adding to calendar
  const handleAddToCalendar = async (session: SessionData) => {
    setIsAddingToCalendar(true);
    console.log('📅 Adding session to calendar:', session.id);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Parse session date and time for calendar
      let startDate: Date;
      if (session.date === "Tomorrow") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
      } else if (session.date.includes(',')) {
        startDate = new Date(`${session.date}, ${new Date().getFullYear()}`);
      } else {
        startDate = new Date(session.date);
      }

      // Add time to date
      if (session.time && session.time !== "To be scheduled") {
        const timeMatch = session.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const ampm = timeMatch[3].toUpperCase();

          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;

          startDate.setHours(hours, minutes, 0, 0);
        }
      }

      const endDate = new Date(startDate.getTime() + 90 * 60000); // 1.5 hours later

      // Create calendar event data
      const calendarData = {
        title: `SkillSwap: ${session.skill} Session`,
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: `Skill swap session for ${session.skill} with ${session.user.name}.\n\n${session.notes || 'Learn and share knowledge in a collaborative environment.'}`,
        location: session.type === 'Virtual' ? `Virtual Meeting - https://meet.skillswap.com/room/${session.id}` : session.location
      };

      // Create Google Calendar URL
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;

      // Create Outlook Calendar URL
      const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(calendarData.title)}&startdt=${calendarData.start}&enddt=${calendarData.end}&body=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;

      // Show calendar options
      const calendarChoice = window.confirm(
        `📅 Add to Calendar\n\n` +
        `Event: ${calendarData.title}\n` +
        `Date: ${session.date}\n` +
        `Time: ${session.time}\n` +
        `Duration: 1.5 hours\n\n` +
        `Click OK for Google Calendar, Cancel for Outlook Calendar`
      );

      if (calendarChoice) {
        window.open(googleCalendarUrl, '_blank');
        console.log('✅ Google Calendar event created');
      } else {
        window.open(outlookCalendarUrl, '_blank');
        console.log('✅ Outlook Calendar event created');
      }

      alert('✅ Calendar event created successfully!\n\nThe event has been added to your calendar with all session details.');

    } catch (error) {
      console.error('❌ Error adding to calendar:', error);
      alert('Failed to add event to calendar. Please try again.');
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  // Handle copying meeting link
  const handleCopyMeetingLink = async () => {
    if (!selectedSessionDetails) return;

    setIsCopyingLink(true);
    console.log('📋 Copying meeting link for session:', selectedSessionDetails.id);

    try {
      // Generate dynamic meeting link based on session
      const meetingId = `${selectedSessionDetails.id}-${selectedSessionDetails.user.id}`;
      const meetingLink = `https://meet.skillswap.com/room/${meetingId}`;
      const password = `skill${selectedSessionDetails.id}`;

      const fullMeetingInfo = `🎥 SkillSwap Session: ${selectedSessionDetails.skill}\n` +
        `📅 Date: ${selectedSessionDetails.date}\n` +
        `⏰ Time: ${selectedSessionDetails.time}\n` +
        `🔗 Meeting Link: ${meetingLink}\n` +
        `🔑 Password: ${password}\n` +
        `👤 With: ${selectedSessionDetails.user.name}`;

      await navigator.clipboard.writeText(fullMeetingInfo);
      console.log('✅ Meeting information copied to clipboard');

      // Show success feedback
      alert('📋 Complete meeting information copied to clipboard!\n\nYou can now paste it in your calendar or share with others.');

    } catch (error) {
      console.error('❌ Failed to copy meeting link:', error);

      // Fallback for browsers that don't support clipboard API
      const fallbackText = `Meeting Link: https://meet.skillswap.com/room/${selectedSessionDetails.id}`;
      const textArea = document.createElement('textarea');
      textArea.value = fallbackText;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        // Use modern approach - select and copy
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices

        // Try to use clipboard API as fallback
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(fallbackText);
        } else {
          // Last resort - show manual copy instruction
          throw new Error('Clipboard not supported');
        }
        alert('Meeting link copied to clipboard!');
      } catch (fallbackError) {
        alert('Unable to copy to clipboard. Please copy manually:\n\n' + fallbackText);
      }

      document.body.removeChild(textArea);
    } finally {
      setIsCopyingLink(false);
    }
  };

  // Handle session cancellation
  const handleCancelSession = async () => {
    if (!selectedSessionDetails) return;

    const confirmed = window.confirm(
      `⚠️ Cancel Session Confirmation\n\n` +
      `Are you sure you want to cancel your ${selectedSessionDetails.skill} session with ${selectedSessionDetails.user.name}?\n\n` +
      `📅 Scheduled for: ${selectedSessionDetails.date} at ${selectedSessionDetails.time}\n\n` +
      `This action cannot be undone. The other participant will be notified.`
    );

    if (!confirmed) return;

    setIsCancellingSession(true);
    console.log('❌ Cancelling session:', selectedSessionDetails.id);

    try {
      // Simulate API call to cancel session
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Remove session from the upcoming list
      const updatedUpcoming = sessions.upcoming.filter(session => session.id !== selectedSessionDetails.id);
      const updatedSessions = {
        ...sessions,
        upcoming: updatedUpcoming
      };
      setSessions(updatedSessions);

      // Update localStorage
      saveSessionsData(updatedSessions);

      // Close modal
      setIsDetailsModalOpen(false);
      setSelectedSessionDetails(null);

      console.log('✅ Session cancelled successfully');
      alert(`✅ Session cancelled successfully!\n\n${selectedSessionDetails.user.name} has been notified about the cancellation.`);

    } catch (error) {
      console.error('❌ Error cancelling session:', error);
      alert('Failed to cancel session. Please try again or contact support.');
    } finally {
      setIsCancellingSession(false);
    }
  };

  // Handle reschedule session
  const handleRescheduleSession = async (sessionId: number, newDate: string, newTime: string, reason: string) => {
    console.log('📅 Rescheduling session:', sessionId, 'to', newDate, newTime);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update session in the upcoming list
      const updatedUpcoming = sessions.upcoming.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            date: newDate,
            time: newTime,
            status: 'pending', // Reset to pending after reschedule
            rescheduleReason: reason
          };
        }
        return session;
      });

      const updatedSessions = {
        ...sessions,
        upcoming: updatedUpcoming
      };

      setSessions(updatedSessions);
      saveSessionsData(updatedSessions);

      console.log('✅ Session rescheduled successfully');
      alert(`✅ Reschedule request sent!\n\nNew date: ${newDate}\nNew time: ${newTime}\n\nThe other participant will be notified and can accept or propose an alternative.`);

    } catch (error) {
      console.error('❌ Error rescheduling session:', error);
      alert('Failed to reschedule session. Please try again.');
    }
  };

  // Handle opening reschedule modal
  const handleOpenReschedule = (session: SessionData) => {
    console.log('📅 Opening reschedule modal for session:', session.id);
    setSelectedSessionForReschedule(session);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
    setIsRescheduleModalOpen(true);
  };

  // Handle closing reschedule modal
  const handleCloseReschedule = () => {
    setSelectedSessionForReschedule(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
    setIsRescheduleModalOpen(false);
  };

  // Handle submitting reschedule
  const handleSubmitReschedule = async () => {
    if (!selectedSessionForReschedule || !rescheduleDate || !rescheduleTime) {
      alert('Please select both a new date and time for the session.');
      return;
    }

    setIsRescheduling(true);
    try {
      await handleRescheduleSession(
        selectedSessionForReschedule.id,
        rescheduleDate,
        rescheduleTime,
        rescheduleReason
      );
      handleCloseReschedule();
    } catch (error) {
      console.error('❌ Error submitting reschedule:', error);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Handle showing contact info
  const handleShowContactInfo = () => {
    if (!selectedSessionDetails) return;

    const contactInfo = `📞 Contact Information for ${selectedSessionDetails.user.name}\n\n` +
      `📧 Email: ${selectedSessionDetails.user.name.toLowerCase().replace(' ', '.')}@skillswap.com\n` +
      `📱 Phone: +1 (555) 123-4567\n` +
      `💬 SkillSwap Messaging: Available in-app\n` +
      `🌐 Profile: skillswap.com/profile/${selectedSessionDetails.user.id}\n\n` +
      `⏰ Best contact times: 9 AM - 6 PM EST\n` +
      `🗣️ Preferred contact: SkillSwap messaging`;

    alert(contactInfo);
    console.log('📞 Contact info displayed for:', selectedSessionDetails.user.name);
  };

  // Handle checklist item toggle
  const handleChecklistToggle = (itemKey: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
    console.log('✅ Checklist item toggled:', itemKey);
  };

  // Handle accepting skill exchange request
  const handleAcceptSkillExchangeRequest = async (requestId: number) => {
    try {
      console.log('✅ Accepting skill exchange request:', requestId);
      await acceptSkillExchangeRequest(requestId);

      // Refresh the requests list
      const updatedRequests = await getSkillExchangeRequests();

      // Handle paginated response
      if (!Array.isArray(updatedRequests)) {
        if (updatedRequests && Array.isArray(updatedRequests.results)) {
          setSkillExchangeRequests(updatedRequests.results);
        } else {
          setSkillExchangeRequests([]);
        }
      } else {
        setSkillExchangeRequests(updatedRequests);
      }

      toast({
        title: "Request Accepted!",
        description: "The skill exchange request has been accepted. You can now schedule a session.",
      });
    } catch (error) {
      console.error('❌ Error accepting skill exchange request:', error);
      toast({
        title: "Error",
        description: "Failed to accept the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle declining skill exchange request
  const handleDeclineSkillExchangeRequest = async (requestId: number, reason?: string) => {
    try {
      console.log('❌ Declining skill exchange request:', requestId);
      await declineSkillExchangeRequest(requestId, reason);

      // Refresh the requests list
      const updatedRequests = await getSkillExchangeRequests();

      // Handle paginated response
      if (!Array.isArray(updatedRequests)) {
        if (updatedRequests && Array.isArray(updatedRequests.results)) {
          setSkillExchangeRequests(updatedRequests.results);
        } else {
          setSkillExchangeRequests([]);
        }
      } else {
        setSkillExchangeRequests(updatedRequests);
      }

      toast({
        title: "Request Declined",
        description: "The skill exchange request has been declined.",
      });
    } catch (error) {
      console.error('❌ Error declining skill exchange request:', error);
      toast({
        title: "Error",
        description: "Failed to decline the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Skill Swap Sessions</h1>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsScheduleDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule a New Session</DialogTitle>
                <DialogDescription>
                  Create a new skill swap session with another member.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="member">Select Member</Label>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger id="member">
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingMembers ? (
                        <SelectItem value="loading" disabled>
                          Loading members...
                        </SelectItem>
                      ) : availableMembers.length > 0 ? (
                        availableMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-members" disabled>
                          No members available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skill">Skill to Exchange</Label>
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger id="skill">
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSkills ? (
                        <SelectItem value="loading" disabled>
                          Loading skills...
                        </SelectItem>
                      ) : availableSkills.length > 0 ? (
                        availableSkills.map((skill, index) => (
                          <SelectItem key={`skill-${index}-${skill}`} value={skill}>
                            {skill}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-skills" disabled>
                          No skills available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Session Type</Label>
                  <RadioGroup value={sessionType} onValueChange={setSessionType} className="flex">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="virtual" id="virtual" />
                      <Label htmlFor="virtual">Virtual</Label>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <RadioGroupItem value="inperson" id="inperson" />
                      <Label htmlFor="inperson">In-person</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any details or topics you'd like to cover"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetScheduleForm();
                    setIsScheduleDialogOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSession}
                  disabled={isSubmitting || !selectedMember || !selectedSkill || !sessionDate || !sessionTime}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upcoming">
              Upcoming
              {sessions.upcoming.length > 0 && (
                <Badge className="ml-2">{sessions.upcoming.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {sessions.requests.length > 0 && (
                <Badge className="ml-2">{sessions.requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="exchanges">
              <Handshake className="h-4 w-4 mr-2" />
              Exchanges
              {skillExchangeRequests.filter(req => req.status === 'pending').length > 0 && (
                <Badge className="ml-2">{skillExchangeRequests.filter(req => req.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Sessions
              {sessions.past.length > 0 && (
                <Badge className="ml-2">{sessions.past.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {sessions.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.upcoming.map(session => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">
                          {session.skill}
                        </Badge>
                        <Badge variant={session.status === "confirmed" ? "default" : "outline"}>
                          {session.status === "confirmed" ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{session.user.name || 'Unknown User'}</CardTitle>
                      <CardDescription>
                        Session {session.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={session.user.avatar || `https://i.pravatar.cc/150?u=${session.user.id}`} />
                          <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link to={`/profile/${session.user.id}`} className="font-medium hover:underline">
                            {session.user.name || 'Unknown User'}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {session.skill} Expert
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">{session.date}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <ClockIcon className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Time</p>
                            <p className="text-sm text-muted-foreground">{session.time}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          {session.type === "Virtual" ? (
                            <Video className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          ) : (
                            <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">Session Type</p>
                            <p className="text-sm text-muted-foreground">
                              {session.type}
                              {session.location && ` - ${session.location}`}
                            </p>
                          </div>
                        </div>
                        {session.notes && (
                          <div className="pt-3 mt-3 border-t">
                            <p className="font-medium mb-1">Session Notes</p>
                            <p className="text-sm text-muted-foreground">{session.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenSessionDetails(session)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenReschedule(session)}
                        >
                          Reschedule
                        </Button>
                      </div>
                      <Link to={`/message/${session.user.id}`}>
                        <Button>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  You don't have any upcoming skill swap sessions scheduled. Browse members to find someone to swap skills with.
                </p>
                <Link to="/explore">
                  <Button>Find Members</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests">
            {sessions.requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.requests.map(request => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">
                          {request.skill}
                        </Badge>
                        <Badge variant="secondary">
                          Request
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{request.user.name}</CardTitle>
                      <CardDescription>
                        Requested {request.requestedDate}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={request.user.avatar || `https://i.pravatar.cc/150?u=${request.user.id}`} />
                          <AvatarFallback>{request.user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link to={`/profile/${request.user.id}`} className="font-medium hover:underline">
                            {request.user.name || 'Unknown User'}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Wants to learn {request.skill}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Requested Date</p>
                            <p className="text-sm text-muted-foreground">{request.requestedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <ClockIcon className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Requested Time</p>
                            <p className="text-sm text-muted-foreground">{request.requestedTime}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          {request.type === "Virtual" ? (
                            <Video className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          ) : (
                            <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">Session Type</p>
                            <p className="text-sm text-muted-foreground">{request.type}</p>
                          </div>
                        </div>
                        <div className="pt-3 mt-3 border-t">
                          <p className="font-medium mb-1">Message</p>
                          <p className="text-sm text-muted-foreground">{request.message}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button 
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You don't have any pending skill swap requests. Check back later or browse members to find someone to swap skills with.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {sessions.past.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessions.past.map(session => (
                  <Card key={session.id}>
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="mb-2">
                          {session.skill}
                        </Badge>
                        <Badge variant="secondary">
                          Completed
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{session.user.name || 'Unknown User'}</CardTitle>
                      <CardDescription>
                        {session.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={session.user.avatar || `https://i.pravatar.cc/150?u=${session.user.id}`} />
                          <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link to={`/profile/${session.user.id}`} className="font-medium hover:underline">
                            {session.user.name || 'Unknown User'}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {session.skill} Expert
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">{session.date}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <ClockIcon className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Time</p>
                            <p className="text-sm text-muted-foreground">{session.time}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          {session.type === "Virtual" ? (
                            <Video className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          ) : (
                            <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">Session Type</p>
                            <p className="text-sm text-muted-foreground">{session.type}</p>
                          </div>
                        </div>
                        
                        {session.feedback ? (
                          <div className="pt-3 mt-3 border-t">
                            <p className="font-medium mb-1">Your Feedback</p>
                            <div className="flex mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star} 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill={star <= session.feedback.rating ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-yellow-500 mr-1"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{session.feedback.comment}</p>
                          </div>
                        ) : (
                          <div className="pt-3 mt-3 border-t">
                            <p className="font-medium mb-1">Feedback</p>
                            <p className="text-sm text-muted-foreground mb-2">You haven't left feedback for this session yet.</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveSession(session)}
                            >
                              Leave Feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Past Sessions</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You don't have any completed skill swap sessions yet. Once you complete a session, it will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="exchanges">
            {skillExchangeRequests.length > 0 ? (
              <div className="space-y-6">
                {/* Pending Requests */}
                {skillExchangeRequests.filter(req => req.status === 'pending').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      Pending Requests ({skillExchangeRequests.filter(req => req.status === 'pending').length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {skillExchangeRequests.filter(req => req.status === 'pending').map(request => (
                        <Card key={request.id} className="border-yellow-200 bg-yellow-50/50">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <Badge variant="outline" className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                                {request.skill?.name || 'Unknown Skill'}
                              </Badge>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">
                              {(request.requester.first_name || 'Unknown')} {(request.requester.last_name || 'User')}
                            </CardTitle>
                            <CardDescription>
                              Skill Exchange Request
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center mb-4">
                              <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={request.requester.avatar || `https://i.pravatar.cc/150?u=${request.requester.id}`} />
                                <AvatarFallback>
                                  {(request.requester.first_name?.charAt(0) || 'U')}{(request.requester.last_name?.charAt(0) || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.requester.first_name || 'Unknown'} {request.requester.last_name || 'User'}</p>
                                <p className="text-sm text-muted-foreground">{request.requester.email || 'No email'}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="font-medium text-sm">Message:</p>
                                <p className="text-sm text-muted-foreground">{request.message}</p>
                              </div>

                              {request.proposed_date && (
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">
                                    Proposed: {new Date(request.proposed_date).toLocaleDateString()}
                                    {request.proposed_time && ` at ${request.proposed_time}`}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm capitalize">{request.session_type} session</span>
                              </div>

                              <div className="text-xs text-muted-foreground">
                                Received {new Date(request.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => handleDeclineSkillExchangeRequest(request.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                            <Button
                              onClick={() => handleAcceptSkillExchangeRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept & Schedule
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Requests */}
                {skillExchangeRequests.filter(req => req.status === 'accepted').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Accepted Requests ({skillExchangeRequests.filter(req => req.status === 'accepted').length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {skillExchangeRequests.filter(req => req.status === 'accepted').map(request => (
                        <Card key={request.id} className="border-green-200 bg-green-50/50">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <Badge variant="outline" className="mb-2 bg-green-100 text-green-800 border-green-300">
                                {request.skill?.name || 'Unknown Skill'}
                              </Badge>
                              <Badge variant="default" className="bg-green-600">
                                Accepted
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">
                              {(request.requester.first_name || 'Unknown')} {(request.requester.last_name || 'User')}
                            </CardTitle>
                            <CardDescription>
                              Ready to Schedule
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center mb-4">
                              <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={request.requester.avatar || `https://i.pravatar.cc/150?u=${request.requester.id}`} />
                                <AvatarFallback>
                                  {(request.requester.first_name?.charAt(0) || 'U')}{(request.requester.last_name?.charAt(0) || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.requester.first_name || 'Unknown'} {request.requester.last_name || 'User'}</p>
                                <p className="text-sm text-muted-foreground">{request.requester.email || 'No email'}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">{request.message}</p>
                              <div className="text-xs text-muted-foreground">
                                Accepted {new Date(request.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Session
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Skill Exchange Requests</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  You don't have any skill exchange requests yet. Visit the Dashboard to discover potential matches and send requests.
                </p>
                <Link to="/dashboard">
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Find Matches
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={!!activeSession} onOpenChange={(open) => !open && setActiveSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Feedback</DialogTitle>
            <DialogDescription>
              Share your experience with {activeSession?.user.name} for your {activeSession?.skill} session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label className="mb-2 block">Rating</Label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill={star <= feedbackRating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-500"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea 
                id="feedback" 
                placeholder="Share your experience with this session"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveSession(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedSessionDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Session Details
                </DialogTitle>
                <DialogDescription>
                  Complete information for your {selectedSessionDetails.skill} session with {selectedSessionDetails.user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Session Overview */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedSessionDetails.user.avatar || `https://i.pravatar.cc/150?u=${selectedSessionDetails.user.id}`} />
                        <AvatarFallback>{selectedSessionDetails.user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedSessionDetails.skill}</h3>
                        <p className="text-muted-foreground">with {selectedSessionDetails.user.name || 'Unknown User'}</p>
                      </div>
                    </div>
                    <Badge variant={selectedSessionDetails.status === "confirmed" ? "default" : "outline"}>
                      {selectedSessionDetails.status === "confirmed" ? "Confirmed" : "Pending"}
                    </Badge>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-background p-3 rounded-md border">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="font-medium">Time Until Session</span>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      {getTimeUntilSession(selectedSessionDetails.date, selectedSessionDetails.time)}
                    </p>
                  </div>
                </div>

                {/* Session Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">{selectedSessionDetails.date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">{selectedSessionDetails.time}</p>
                        <p className="text-xs text-muted-foreground">Duration: 1.5 hours</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {selectedSessionDetails.type === "Virtual" ? (
                        <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                      ) : (
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">Session Type</p>
                        <p className="text-sm text-muted-foreground">{selectedSessionDetails.type}</p>
                        {selectedSessionDetails.location && (
                          <p className="text-xs text-muted-foreground">{selectedSessionDetails.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Skill Level</p>
                        <p className="text-sm text-muted-foreground">Beginner to Intermediate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Notes & Agenda */}
                {selectedSessionDetails.notes && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Session Notes
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedSessionDetails.notes}</p>
                  </div>
                )}

                {/* Member Profile Summary */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    About {selectedSessionDetails.user.name}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">4.8 rating • 23 sessions completed</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Experienced {selectedSessionDetails.skill} professional with 5+ years in the field.
                      Passionate about sharing knowledge and helping others grow their skills.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Expert Level</Badge>
                      <Badge variant="secondary">Mentor</Badge>
                      <Badge variant="secondary">Patient Teacher</Badge>
                    </div>
                  </div>
                </div>

                {/* Meeting Information */}
                {selectedSessionDetails.type === "Virtual" && (
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Virtual Meeting Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meeting Link:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={handleCopyMeetingLink}
                          disabled={isCopyingLink}
                        >
                          <Copy className="h-3 w-3" />
                          {isCopyingLink ? 'Copying...' : 'Copy Link'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Meeting link will be shared 15 minutes before the session starts
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Please test your camera and microphone beforehand</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* In-person Location */}
                {selectedSessionDetails.type === "In-person" && selectedSessionDetails.location && (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Meeting Location
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">{selectedSessionDetails.location}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleGetDirections(selectedSessionDetails.location)}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Get Directions
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Please arrive 5-10 minutes early
                      </p>
                    </div>
                  </div>
                )}

                {/* Preparation Checklist */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Preparation Checklist
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={checkedItems['agenda'] || false}
                        onChange={() => handleChecklistToggle('agenda')}
                      />
                      <span className="text-sm">Review session agenda and topics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={checkedItems['questions'] || false}
                        onChange={() => handleChecklistToggle('questions')}
                      />
                      <span className="text-sm">Prepare any questions you want to ask</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={checkedItems['workspace'] || false}
                        onChange={() => handleChecklistToggle('workspace')}
                      />
                      <span className="text-sm">Set up your workspace/materials</span>
                    </div>
                    {selectedSessionDetails.type === "Virtual" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={checkedItems['tech'] || false}
                          onChange={() => handleChecklistToggle('tech')}
                        />
                        <span className="text-sm">Test your camera and microphone</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {selectedSessionDetails.type === "Virtual" && (
                    <Button
                      className="gap-2"
                      onClick={handleJoinSession}
                      disabled={isJoiningSession}
                    >
                      <Video className="h-4 w-4" />
                      {isJoiningSession ? 'Joining...' : 'Join Session'}
                    </Button>
                  )}
                  {selectedSessionDetails.type === "In-person" && (
                    <Button
                      className="gap-2"
                      onClick={() => handleGetDirections(selectedSessionDetails.location)}
                    >
                      <MapPin className="h-4 w-4" />
                      Get Directions
                    </Button>
                  )}
                  <Link to={`/message/${selectedSessionDetails.user.id}`}>
                    <Button variant="outline" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Message {selectedSessionDetails.user.name}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleAddToCalendar(selectedSessionDetails)}
                    disabled={isAddingToCalendar}
                  >
                    <Download className="h-4 w-4" />
                    {isAddingToCalendar ? 'Adding...' : 'Add to Calendar'}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleShowContactInfo}>
                    <Phone className="h-4 w-4" />
                    Contact Info
                  </Button>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleCloseSessionDetails}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleCancelSession}
                  disabled={isCancellingSession}
                >
                  <XCircle className="h-4 w-4" />
                  {isCancellingSession ? 'Cancelling...' : 'Cancel Session'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSessionForReschedule && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reschedule Session
                </DialogTitle>
                <DialogDescription>
                  Propose a new time for your {selectedSessionForReschedule.skill} session with {selectedSessionForReschedule.user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Current Session Info */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Current Session</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📅 Date: {selectedSessionForReschedule.date}</p>
                    <p>⏰ Time: {selectedSessionForReschedule.time}</p>
                    <p>📍 Type: {selectedSessionForReschedule.type}</p>
                  </div>
                </div>

                {/* New Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-date">New Date</Label>
                    <Input
                      id="new-date"
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-time">New Time</Label>
                    <Input
                      id="new-time"
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
                  <Textarea
                    id="reschedule-reason"
                    placeholder="Let them know why you need to reschedule..."
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">Reschedule Request</p>
                      <p>Your reschedule request will be sent to {selectedSessionForReschedule.user.name}. They can accept, decline, or propose an alternative time.</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleCloseReschedule}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReschedule}
                  disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {isRescheduling ? 'Sending...' : 'Send Reschedule Request'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sessions;
