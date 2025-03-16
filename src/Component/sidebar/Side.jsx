import {
  FaBookOpen,
  FaChevronRight,
  FaClipboardList,
  FaEdit,
  FaInfoCircle,
  FaLock,
  FaPhoneSquareAlt,
  FaShare,
  FaStar,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaTelegramPlane,
  FaLink,
  FaKey,
} from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { BiSolidDashboard } from "react-icons/bi";
import { IoPeopleSharp } from "react-icons/io5";
import { FaRegMoneyBill1 } from "react-icons/fa6";
import { MdPersonAddAlt1 } from "react-icons/md";
import { BsCashCoin } from "react-icons/bs";
import { useAuth } from "../../AuthContext";
import "./../../../src/styles/Side.css?v=11 ";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react"; // Add useRef to imports
import {
  Button,
  CloseButton,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap"; // Add Tooltip and OverlayTrigger to imports
import { MdEmail } from "react-icons/md";
import Swal from "sweetalert2";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions
import PinSetupModal from "./PinSetupModal";

const Side = () => {
  const { toggleSidebar } = useAuth();
  const { isSidebarVisible } = useAuth();
  const [openMenus, setOpenMenus] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [isSwitchOn, setIsPinSet] = useState(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const db = getFirestore(); // Initialize Firestore
  const sidebarRef = useRef(); // Add this ref
  const { logout } = useAuth();
  const [pinToggle, setPinToggle] = useState(false);

  const handlePinSet = async (pin) => {
    const adminId = localStorage.getItem("adminDocId");
    const employeeId = localStorage.getItem("EmployeeDocId");
    const userIde = adminId || employeeId;
    const Role = adminId ? "admin" : "employee";
    const collectionPath = Role === "admin" ? "Admin" : "Users";

    try {
      await setDoc(doc(db, collectionPath, userIde), { 
        pin,
        isSwitchOn: true 
      }, { merge: true });
      
      setIsPinSet(true);
      setPinToggle(true);
      localStorage.setItem('isSwitchOn', 'true');
      setShowSetPinModal(false);
      setShowPinSetupModal(false);
      
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "PIN set successfully!",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        width: "250px",
      });
    } catch (error) {
      console.error("Error setting PIN:", error);
      setPinToggle(false);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to set PIN",
        text: "Please try again",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        width: "250px",
      });
    }
  };

  useEffect(() => {
    const checkPin = async () => {
      const adminId = localStorage.getItem("adminDocId");
      const employeeId = localStorage.getItem("EmployeeDocId");
      const userIde = adminId || employeeId;
      const Role = adminId ? "admin" : "employee";
      const collectionPath = Role === "admin" ? "Admin" : "Users";

      if (userIde) {
        const userDoc = await getDoc(doc(db, collectionPath, userIde));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsPinSet(!!userData.pin);
        }
      }
    };

    checkPin();
  }, [db]);

  useEffect(() => {
    const checkPinStatus = async () => {
      const adminId = localStorage.getItem("adminDocId");
      const employeeId = localStorage.getItem("EmployeeDocId");
      const userIde = adminId || employeeId;
      const Role = adminId ? "admin" : "employee";
      const collectionPath = Role === "admin" ? "Admin" : "Users";

      if (userIde) {
        const userDoc = await getDoc(doc(db, collectionPath, userIde));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPinToggle(!!userData.isSwitchOn);
          setIsPinSet(!!userData.pin);
        }
      }
    };

    checkPinStatus();
  }, [db]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (sidebarRef.current &&
  //         !sidebarRef.current.contains(event.target) &&
  //         isSidebarVisible) {
  //       toggleSidebar();
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     // document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [isSidebarVisible, toggleSidebar]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const role = localStorage.getItem("Role");

  const shareData = {
    title: "My Expense Tracker",
    text: "Check out this amazing expense tracker!",
    url: window.location.href,
  };

  const ShareModal = ({ show, onHide, shareData }) => {
    const handleCopyLink = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareData.url);
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Link copied!",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            width: "250px",
            padding: "5px",
            customClass: {
              popup: "small-toast",
              title: "small-toast-title",
            },
          });
        } else {
          // Fallback for browsers that don't support navigator.clipboard
          const textArea = document.createElement("textarea");
          textArea.value = shareData.url;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
            if (successful) {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Link copied!",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                width: "250px",
                padding: "5px",
                customClass: {
                  popup: "small-toast",
                  title: "small-toast-title",
                },
              });
            } else {
              Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Failed to copy link",
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                width: "250px",
              });
            }
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            Swal.fire({
              position: "top-end",
              icon: "error",
              title: "Failed to copy link",
              showConfirmButton: false,
              timer: 1500,
              toast: true,
              width: "250px",
            });
          } finally {
            document.body.removeChild(textArea);
          }
        }
      } catch (error) {
        console.error("Error copying to clipboard", error);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to copy link",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          width: "250px",
        });
      }
    };

    const shareLinks = {

      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        shareData.text + " " + shareData.url
      )}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareData.url
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareData.url
      )}&text=${encodeURIComponent(shareData.text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareData.url
      )}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        shareData.url
      )}&text=${encodeURIComponent(shareData.text)}`,
      email: `mailto:?subject=${encodeURIComponent(
        shareData.title
      )}&body=${encodeURIComponent(shareData.text + "\n\n" + shareData.url)}`,
    };

    const shareButtons = [
      {
        icon: <FaWhatsapp />,
        label: "WhatsApp",
        link: shareLinks.whatsapp,
        color: "#25D366",
      },
      {
        icon: <FaFacebookF />,
        label: "Facebook",
        link: shareLinks.facebook,
        color: "#1877F2",
      },
      {
        icon: <FaTwitter />,
        label: "Twitter",
        link: shareLinks.twitter,
        color: "#1DA1F2",
      },
      {
        icon: <FaLinkedinIn />,
        label: "LinkedIn",
        link: shareLinks.linkedin,
        color: "#0A66C2",
      },
      {
        icon: <FaTelegramPlane />,
        label: "Telegram",
        link: shareLinks.telegram,
        color: "#0088cc",
      },
      {
        icon: <MdEmail />,
        label: "Email",
        link: shareLinks.email,
        color: "#EA4335",
      },
    ];

    return (
      <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header>
        <Modal.Title>Share</Modal.Title>
        <button type="button" className="close-button" onClick={onHide}>
        &times;
        </button>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
        {shareButtons.map((btn, index) => (
          <a
          key={index}
          href={btn.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none"
          onClick={(e) => {
            e.preventDefault();
            if (window.innerWidth <= 768) {
            const urlParts = shareData.url.split('/');
            const shortUrl = urlParts.slice(-2).join('/');
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Link copied: .../${shortUrl}`,
              showConfirmButton: false,
              timer: 1500,
              toast: true,
              width: "250px",
              padding: "5px",
              customClass: {
              popup: "small-toast",
              title: "small-toast-title",
              },
            });
            } else {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Link copied!",
              showConfirmButton: false,
              timer: 1500,
              toast: true,
              width: "250px",
              padding: "5px",
              customClass: {
              popup: "small-toast",
              title: "small-toast-title",
              },
            });
            }
            window.open(btn.link, "_blank", "width=600,height=400");
          }}
          >
          <div className="d-flex flex-column align-items-center gap-2">
            <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: btn.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.5rem",
            }}
            >
            {btn.icon}
            </div>
            <span style={{ fontSize: "0.8rem", color: "#666" }}>
            {btn.label}
            </span>
          </div>
          </a>
        ))}
        </div>

        <div className="position-relative">
        <input
          type="text"
          value={window.innerWidth <= 768 ? `${shareData.url.slice(0, -10)}...` : shareData.url}
          readOnly
          className="form-control pe-5"
          style={{ backgroundColor: "#f8f9fa" }}
          title={shareData.url}
        />
        <button
          className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
          onClick={handleCopyLink}
          style={{ textDecoration: "none" }}
        >
          <FaLink /> Copy
        </button>
        </div>
      </Modal.Body>
      </Modal>
    );
  };

  const SetPinModal = ({ show, onHide }) => {
    const [pin, setPin] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      handlePinSet(pin);
    };

    return (
      <Modal show={show} onHide={onHide} centered size="sm">
        <Modal.Header>
          <Modal.Title>Set PIN</Modal.Title>
          <button type="button" className="close-button" onClick={onHide}>
            &times;
          </button>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="pin">Enter 4-digit PIN</label>
              <input
                type="password"
                className="form-control mt-2"
                id="pin"
                maxLength="4"
                pattern="[0-9]{4}"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onHide} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Set PIN
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Add touch event handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const diffX = touch.clientX - startX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0 && !isSidebarVisible) {
          toggleSidebar();
        } else if (diffX < 0 && isSidebarVisible) {
          toggleSidebar();
        }
        document.removeEventListener("touchmove", handleTouchMove);
      }
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener(
      "touchend",
      () => {
        document.removeEventListener("touchmove", handleTouchMove);
      },
      { once: true }
    );
  };

  const renderTooltip = (props, label) => (
    <Tooltip id="button-tooltip" {...props}>
      {label}
    </Tooltip>
  );
  

  // const getPinMenuItem = () => (
  //   <li>
  //     {/* <OverlayTrigger
  //       placement="right"
  //       popperConfig={{
  //         modifiers: [{ name: "offset", options: { offset: [0, -25] } }],
  //       }}
  //       delay={{ show: 200, hide: 200 }}
  //       overlay={(props) =>
  //         renderTooltip(props, `${isSwitchOn ? "Change" : "Set"} PIN`)
  //       }
  //       show={!isSidebarVisible ? undefined : false}
  //     > */}
  //       <div className="nav-link text-light d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }}>
  //         <div className="d-flex align-items-center">
  //           <FaKey style={{ width: "20px", height: "20px" }} />
  //           {isSidebarVisible && <span className="ms-2">Set PIN</span>}
  //         </div>
  //         {isSidebarVisible && (
  //           <div className="form-check form-switch ">
  //             <input
  //               type="checkbox"
  //               className="form-check-input"
  //               checked={pinToggle}
  //               onChange={async (e) => {
  //                 const isChecked = e.target.checked;
  //                 setPinToggle(isChecked);

  //                 if (isChecked) {
  //                   setShowPinModal(true); // Change this from setShowPinSetupModal to setShowPinModal
  //                 } else {
  //                   const adminId = localStorage.getItem("adminDocId");
  //                   const employeeId = localStorage.getItem("EmployeeDocId");
  //                   const userIde = adminId || employeeId;
  //                   const Role = adminId ? "admin" : "employee";
  //                   const collectionPath = Role === "admin" ? "Admin" : "Users";

  //                   try {
  //                     await setDoc(doc(db, collectionPath, userIde), 
  //                       { 
  //                         isSwitchOn: false,
  //                         pin: null  // Clear the PIN when disabled
  //                       }, 
  //                       { merge: true }
  //                     );
  //                     setIsPinSet(false);
  //                     localStorage.setItem('isSwitchOn', 'false');
  //                     Swal.fire({
  //                       position: "top-end",
  //                       icon: "success",
  //                       title: "Login PIN disabled",
  //                       showConfirmButton: false,
  //                       timer: 1500,
  //                       toast: true,
  //                       width: "250px",
  //                     });
  //                   } catch (error) {
  //                     console.error("Error updating pin status:", error);
  //                     setPinToggle(true); // Revert toggle if update fails
  //                   }
  //                 }
  //               }}
  //             />
  //           </div>
  //         )}
  //       </div>
  //     {/* </OverlayTrigger> */}
  //   </li>
  // );

  // const handleLogout = async (e) => {
  //   e.preventDefault();
  //   try {
  //     localStorage.clear(); // Clear all items from localStorage
  //     await logout();
  //     navigate("/", { replace: true });
  //     Swal.fire({
  //       toast: true,
  //       position: "top-end",
  //       icon: "success",
  //       title: "Logged out successfully!",
  //       showConfirmButton: false,
  //       timer: 2000,
  //       timerProgressBar: true,
  //     });
  //   } catch {
  //     Swal.fire("Error", "Logout failed", "error");
  //   }
  // };

  return (
    <>
      <div
        ref={sidebarRef} // Add this ref to the sidebar div
        style={{
          paddingBottom: "10%",
          paddingLeft: isSidebarVisible ? "15px" : "5px",
          backgroundColor: "#0558b4",
          width: isSidebarVisible ? "270px" : "60px",
          transition: "all 0.3s ease-in-out",
          zIndex: "1000",
          overflowX: "hidden",
        }}
        className={`sidebar text-white hidden-scroll overflow-auto h-64 sidebar
         d-print-none ${isSidebarVisible ? "sidebar-visible" : "close"}`}
        onTouchStart={handleTouchStart}
      >
        {/* Sidebar Header with Close Button */}
        {/* <div className={`sidebar-header  p-3  `}>
          {isSidebarVisible ? (
            <center>
              <span
                style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}
              >
                {role === "admin" ? "Admin" : "MAIN"}
              </span>
            </center>
          ) : (
            " "
          )}    
        </div> */}

        {/* Sidebar Menu */}
        {role === "admin" && (
          <ul className="nav flex-column">
            <li className="nav-item">
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 100 , hide: 100 }}
                overlay={(props) => renderTooltip(props, "Dashboard")}
                show={!isSidebarVisible ? undefined : false}
              >
                <Link
                  to="/dashboard"
                  className="nav-link text-light"
                  onClick={() => toggleSidebar()}
                >
                  <BiSolidDashboard className={`me-2 i `} />{" "}
                  {isSidebarVisible ? "Dashboard" : " "}
                </Link>
              </OverlayTrigger>
            </li>

            {/* Employee Section */}
            <li
              className={`nav-item ${
                openMenus.employee ? (isSidebarVisible ? "active" : "") : " "
              }`}
            >
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Employees")}
                show={!isSidebarVisible ? undefined : false}
              >
                <div
                  className="nav-link text-light sub"
                  onClick={() => {
                    toggleMenu("employee");
                  }}
                >
                  <div>
                    <IoPeopleSharp
                      onClick={() => toggleSidebar()}
                      className="me-2 i"
                    />{" "}
                    {isSidebarVisible ? "Employees" : " "}
                  </div>
                  {isSidebarVisible ? (
                    <FaChevronRight className="dropdown-arrow" />
                  ) : (
                    " "
                  )}
                </div>
              </OverlayTrigger>
              <ul className="sub-menu">
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Add Employee")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/addemployee"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <MdPersonAddAlt1 className="me-2 i" />{" "}
                      {isSidebarVisible ? "Add Employee" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Employees List")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/employee_list"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaClipboardList className="me-2 i" />{" "}
                      {isSidebarVisible ? "Employees List" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
              </ul>
            </li>

            {/* Expenses Section */}
            <li
              className={`nav-item ${
                openMenus.expenses ? (isSidebarVisible ? "active" : "") : ""
              }`}
            >
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Expenses")}
                show={!isSidebarVisible ? undefined : false}
              >
                <div
                  className="nav-link text-light sub"
                  onClick={() => toggleMenu("expenses")}
                >
                  <div>
                    <FaRegMoneyBill1
                      onClick={() => toggleSidebar()}
                      className="me-2 i"
                    />{" "}
                    {isSidebarVisible ? "Expenses" : " "}
                  </div>
                  {isSidebarVisible ? (
                    <FaChevronRight className="dropdown-arrow" />
                  ) : (
                    " "
                  )}
                </div>
              </OverlayTrigger>
              <ul className="sub-menu">
              <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Add Expense")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/addexpenses"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <BsCashCoin className="me-2 i" />{" "}
                      {isSidebarVisible ? "Add Expense" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Expense List")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/expense_list"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaBookOpen className="me-2 i" />{" "}
                      {isSidebarVisible ? "Expense List" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
              </ul>
            </li>

            {/* Profile Section */}
            <li
              className={`nav-item ${
                openMenus.profile ? (isSidebarVisible ? "active" : "") : ""
              }`}
            >
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Profile")}
                show={!isSidebarVisible ? undefined : false}
              >
                <div
                  className="nav-link text-light sub"
                  onClick={() => toggleMenu("profile")}
                >
                  <div>
                    <CgProfile
                      onClick={() => toggleSidebar()}
                      className="me-2 i"
                    />{" "}
                    {isSidebarVisible ? "Profile" : " "}
                  </div>
                  {isSidebarVisible ? (
                    <FaChevronRight className="dropdown-arrow" />
                  ) : (
                    " "
                  )}
                </div>
              </OverlayTrigger>
              <ul className="sub-menu">
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Edit Profile")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/editprofile"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaEdit style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Edit Profile" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Change Password")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/changepassword"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaLock style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Change Password" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Rate Us")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/rateus"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaStar style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Rate Us" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Share")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      onClick={() => {
                        handleShare();
                        toggleSidebar();
                      }}
                      className="nav-link text-light"
                    >
                      <FaShare style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Share" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                {/* {getPinMenuItem()} */}
              </ul>
            </li>

            {/* About Us */}
            <li className="nav-item">
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "About Us")}
                show={!isSidebarVisible ? undefined : false}
              >
                <Link
                  to="/aboutus"
                  className="nav-link text-light"
                  onClick={() => toggleSidebar()}
                >
                  <FaInfoCircle className="me-2 i" />{" "}
                  {isSidebarVisible ? "About Us" : " "}
                </Link>
              </OverlayTrigger>
            </li>

            {/* Contact Us */}
            <li className="nav-item">
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Contact Us")}
                show={!isSidebarVisible ? undefined : false}
              >
                <Link
                  to="/contact"
                  className="nav-link text-light"
                  onClick={() => toggleSidebar()}
                >
                  <FaPhoneSquareAlt className="me-2 i" />{" "}
                  {isSidebarVisible ? "Contact Us" : " "}
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        )}

        {role === "employee" && (
          <ul className="nav flex-column">
            <li className="nav-item">
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Dashboard")}
                show={!isSidebarVisible ? undefined : false}
              >
                <Link
                  to="/dashboard"
                  className="nav-link text-light"
                  onClick={() => toggleSidebar()}
                >
                  <BiSolidDashboard className={`me-2 i `} />{" "}
                  {isSidebarVisible ? "Dashboard" : " "}
                </Link>
              </OverlayTrigger>
            </li>

            {/* Expenses Section */}
            <li
              className={`nav-item ${
                openMenus.expenses ? (isSidebarVisible ? "active" : "") : ""
              }`}
            >
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Expenses")}
                show={!isSidebarVisible ? undefined : false}
              >
                <div
                  className="nav-link text-light sub"
                  onClick={() => toggleMenu("expenses")}
                >
                  <div>
                    <FaRegMoneyBill1
                      onClick={() => toggleSidebar()}
                      className="me-2 i"
                    />{" "}
                    {isSidebarVisible ? "Expenses" : " "}
                  </div>
                  {isSidebarVisible ? (
                    <FaChevronRight className="dropdown-arrow" />
                  ) : (
                    " "
                  )}
                </div>
              </OverlayTrigger>
              <ul className="sub-menu">
              <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Add Expense")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/addexpenses"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <BsCashCoin className="me-2 i" />{" "}
                      {isSidebarVisible ? "Add Expense" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Expense List")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to={
                        role === "admin"
                          ? "/expense_list"
                          : "/EmployeeExpensesList"
                      }
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaBookOpen className="me-2 i" />{" "}
                      {isSidebarVisible ? "Expense List" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
              </ul>
            </li>

            {/* Profile Section */}
            <li
              className={`nav-item ${
                openMenus.profile ? (isSidebarVisible ? "active" : "") : ""
              }`}
            >
              <OverlayTrigger
                placement="right"
                popperConfig={{
                  modifiers: [
                    { name: "offset", options: { offset: [0, -25] } },
                  ],
                }}
                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Profile")}
                show={!isSidebarVisible ? undefined : false}
              >
                <div
                  className="nav-link text-light sub "
                  onClick={() => toggleMenu("profile")}
                >
                  <div>
                    <CgProfile
                      onClick={() => toggleSidebar()}
                      className="me-2 i"
                    />{" "}
                    {isSidebarVisible ? "Profile" : " "}
                  </div>
                  {isSidebarVisible ? (
                    <FaChevronRight className="dropdown-arrow" />
                  ) : (
                    " "
                  )}
                </div>
              </OverlayTrigger>
              <ul className="sub-menu ">
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Profile")}
                    show={!isSidebarVisible ? undefined : false}
                  > */}
                    <Link
                      to="/profile"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaEdit style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Profile" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Edit Profile")}
                  > */}
                    <Link
                      to={
                        role === "admin"
                          ? "/editprofile"
                          : "/EmployeeEditProfile"
                      }
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaEdit style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Edit Profile" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Change Password")}
                  > */}
                    <Link
                      to="/changepassword"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaLock style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Change Password" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Rate Us")}
                  > */}
                    <Link
                      to="/rateus"
                      className="nav-link text-light"
                      onClick={() => toggleSidebar()}
                    >
                      <FaStar style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Rate Us" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                <li>
                  {/* <OverlayTrigger
                    placement="right"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, -25] } },
                      ],
                    }}
                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Share")}
                  > */}
                    <Link
                      onClick={() => {
                        handleShare();
                        toggleSidebar();
                      }}
                      className="nav-link text-light"
                    >
                      <FaShare style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Share" : " "}
                    </Link>
                  {/* </OverlayTrigger> */}
                </li>
                {/* {getPinMenuItem()} */}
                {/* <li>
                  <OverlayTrigger
                    placement="right"                 popperConfig={{ modifiers: [{ name: "offset", options: { offset: [0, -25] } }] }}

                    delay={{ show: 200, hide: 200 }}
                    overlay={(props) => renderTooltip(props, "Logout")}
                  >
                    <Link
                      to="/"
                      className="nav-link text-light"
                      onClick={() => {
                        toggleSidebar();
                        handleLogout;
                      }}
                    >
                      <TbLogout style={{ width: "20px", height: "20px" }} />
                      {isSidebarVisible ? "Logout" : " "}
                    </Link>
                  </OverlayTrigger>
                </li> */}
              </ul>
            </li>

            {/* About Us */}
            {/* <li className="nav-item">
              <OverlayTrigger
                placement="right"                 popperConfig={{ modifiers: [{ name: "offset", options: { offset: [0, -25] } }] }}

                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "About Us")}
              >
                <Link
                  to="/aboutus"
                  className="nav-link text-light"
                  onClick={() => toggleSidebar()}
                >
                  <FaInfoCircle className="me-2 i" />{" "}
                  {isSidebarVisible ? "About Us" : " "}
                </Link>
              </OverlayTrigger>
            </li> */}

            {/* Contact Us */}
            {/* <li className="nav-item">
              <OverlayTrigger
                placement="right"                 popperConfig={{ modifiers: [{ name: "offset", options: { offset: [0, -25] } }] }}

                delay={{ show: 200, hide: 200 }}
                overlay={(props) => renderTooltip(props, "Contact Us")}
              >
                <Link
                  to="/contact"
                  className="nav-link text-light"
                  onClick={() => toggleSidebar()}
                >
                  <FaPhoneSquareAlt className="me-2 i" />{" "}
                  {isSidebarVisible ? "Contact Us" : " "}
                </Link>
              </OverlayTrigger>
            </li> */}
          </ul>
        )}
      </div>
      <ShareModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        shareData={shareData}
      />
      <SetPinModal
        show={showSetPinModal}
        onHide={() => setShowSetPinModal(false)}
      />
      <PinSetupModal
        show={showPinModal}
        onHide={() => setShowPinModal(false)}
        onVerify={handlePinSet}
      />
    </>
  );
};

export default Side;
