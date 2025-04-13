import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import '../../styles/PinModal.css';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { db } from '../../Firebase';
import PinSetupModal from './PinSetupModal';
import { InfinitySpin, ThreeCircles } from 'react-loader-spinner';
import DefaultImage from "./../sidebar/Home/team-member.jpg"

const PinVerificationModal = ({ show, onHide, onVerify,  }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
      image: "",
    });
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRef = useRef(null);
  const doneButtonRef = useRef(null);
  const navigate = useNavigate();
    
    const adminId = localStorage.getItem("adminDocId");
    const employeeId = localStorage.getItem("EmployeeDocId");
    const userIde = adminId || employeeId;
    const Role = adminId ? "admin" : "employee";

    const collectionPath = Role === "admin" ? "Admin" : "Users";
    const docRef = userIde ? doc(db, collectionPath, userIde) : null;

    useEffect(() => {
      if (docRef) {
        const unsubscribe = onSnapshot(docRef, async (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            try {
              const imageUrl = Role === "admin" ? userData.company_logo : userData.employee_logo || "";
              setFormData({
                ...userData,
                image: imageUrl,
                type: Role,
                role: localStorage.getItem("Role") || Role
              });
            } catch {
              setFormData({
                ...userData,
                image: "",
                type: Role,
                role: localStorage.getItem("Role") || Role
              });
            }
          } else {
            Swal.fire("Error", "User  not found", "error");
          }
        });

        return () => unsubscribe();
      }
    }, [docRef, Role]);

    useEffect(() => {
      if (show) {
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }
    }, [show]);

  const handleVerify = async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
      await onVerify(pin);
      onHide();
      navigate('/dashboard');
      doneButtonRef.current.focus();
      
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        }}>
          <ThreeCircles
            visible={true}
            width="200"
            color="#0558b4"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      );
    } catch (error) {
      setError('Invalid PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  const [showPinSetup, setShowPinSetup] = useState(false);

  const handleForgotPin = (e) => {
    e.preventDefault();
    onHide(); // Close the verification modal
    setShowPinSetup(true); // Open the pin setup modal
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255)',
          zIndex: 9999
        }}>
          <ThreeCircles
            visible={true}
            width="200"
            color="#0558b4"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      )}
      <Modal show={show} onHide={onHide} centered className="pin-modal" onEntered={() => pinInputRef.current && pinInputRef.current.focus()}>
        <Modal.Header>
          <Modal.Title>Enter Profile PIN</Modal.Title>
          <button type="button" className="btn-close text-light" onClick={
            () => {
              onHide();
              localStorage.clear();
            }
          } style={{ color: '#fff' }}></button>
        </Modal.Header>
        <Modal.Body>
          <div className="profile-icon">
            <img className="profile-imag rounded-circle border border-primary" src={formData.image || DefaultImage} alt="Profile Icon" />
          </div>
          <p>The Profile PIN is required to access this profile.</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>4-digit PIN</Form.Label>
              <div className="d-flex align-items-center justify-content-center pin-input-wrapper">
                <Form.Control
                  type={showPin ? "text" : "password"}
                  value={pin}
                  pattern='\d*'
                  onChange={(e) => {setPin(e.target.value.replace(/\D/g, ''));
                    if(e.target.value.length === 4){
                      document.getElementById('done').focus();
                    }
                    }}
                  
                  maxLength={4}
                  placeholder="••••"
                  className=" pin-input"
                  style={{ textAlign: 'center',fontWeight:"bolder",fontSize:"20px", letterSpacing: '1.5rem' }}
                  ref={pinInputRef}
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                />
                <span onClick={togglePinVisibility} className="pin-toggle">
                  {showPin ? <FaRegEye /> : <FaRegEyeSlash />}
                </span>
              </div>
            </Form.Group>
              {error && <p className="text-danger">{error}</p>}
            <a href="" className="forgot-pin" onClick={handleForgotPin}>Forgot PIN?</a>
            <Modal.Footer>
              <Button 
              id="done"
                ref={doneButtonRef}
                type="submit" 
                variant="primary" 
                className="done-button"
              >
                Done
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      
      <PinSetupModal 
        show={showPinSetup}
        onHide={() => setShowPinSetup(false)}
      />
    </>
  );
};

export default PinVerificationModal;