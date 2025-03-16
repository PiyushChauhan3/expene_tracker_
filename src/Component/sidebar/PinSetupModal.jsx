import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import '../../styles/PinModal.css';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { db } from '../../Firebase';
import PinInput from 'react-pin-input';
import DefaultImage from '../../assets/images/default-profile.png';

const PinSetupModal = ({ show = false, onHide = () => {}, onVerify = () => {}, profileImage = '' }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
   
      image: "",
  
    });
    
    const adminId = localStorage.getItem("adminDocId");
    const employeeId = localStorage.getItem("EmployeeDocId");
    const userIde = adminId || employeeId;
    const Role = adminId ? "admin" : "employee";

    const collectionPath = Role === "admin" ? "Admin" : "Users";
    const docRef = userIde ? doc(db, collectionPath, userIde) : null;

    const navigate = useNavigate();

    const pinInputRef = useRef(null);
    const doneButtonRef = useRef(null);

    useEffect(() => {
      if (show) {
        pinInputRef.current.focus();
      }
    }, [show]);

    useEffect(() => {
      if (docRef) {
        const unsubscribe = onSnapshot(docRef, async (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            try {
              const imageUrl = Role === "admin" ? userData.company_logo : userData.employee_logo || DefaultImage;
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
            Swal.fire("Error", "User data not found", "error");
          }
        });

        return () => unsubscribe();
      }
    }, [docRef, Role]);
  const handleSubmit = async () => {
    try {
      // Validation checks
      if (!/^\d{4}$/.test(pin)) {
        setError('PIN must be exactly 4 digits');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }

      setError('');
      setIsLoading(true);

      // Save PIN to Firebase
      if (docRef) {
        await updateDoc(docRef, {
          pin: pin,
          isSwitchOn: true
        });

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'PIN Setup Complete',
          text: 'Your PIN has been successfully set',
          timer: 1500
        });

        // Store necessary items in localStorage
        localStorage.setItem('isSwitchOn', 'true');
        // localStorage.setItem('isLoggedIn', 'true');

        // Clear form and close modal
        setPin('');
        setConfirmPin('');
        onHide();

        // Redirect to dashboard based on role
        if (Role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Document reference not found');
      }

    } catch (error) {
      console.error('PIN setup error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to set PIN. Please try again.'
      });
    } finally {
      setIsLoading(false);
      doneButtonRef.current.focus();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="pin-modal" backdrop="static" keyboard={false} >
      <Modal.Header>
        <Modal.Title>Set Profile PIN</Modal.Title>
        <button onClick={() => { onHide(); window.location.reload(); }} style={{ color: '#fff', background: 'none', border: 'none' }}>X</button>
      </Modal.Header>
          <Modal.Body>
            <div className="profile-icon">
              <img src={formData.image || DefaultImage } alt="Profile Icon" className="profile-imag rounded-circle border border-primary" />
            </div>
            <p>Create a 4-digit PIN to protect your profile.</p>
            <Form>
              <Form.Group className="mb-3">
            <Form.Label>New PIN</Form.Label>
            <div className="d-flex align-items-center justify-content-center pin-input-wrapper">
              <Form.Control
                ref={pinInputRef}
                type={showPin ? "text" : "password"}
                value={pin}
                pattern='\d*'
                onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              if (e.target.value.length === 4) {
                document.getElementById('confirmPinInput').focus();
              }
                }}
                maxLength={4}
                placeholder="••••"
                className="pin-input"
                style={{ textAlign: 'center', fontWeight: "bolder", fontSize: "20px", letterSpacing: '1.5rem' }}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
              />
              <span onClick={() => setShowPin(!showPin)} className="pin-toggle">
                {showPin ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>
              </Form.Group>

              <Form.Group className="mb-3">
            <Form.Label>Confirm PIN</Form.Label>
            <div className="d-flex align-items-center justify-content-center pin-input-wrapper">
              <Form.Control
                id="confirmPinInput"
                
                type={showConfirmPin ? "text" : "password"}
                value={confirmPin}
                pattern='\d*'
                onChange={(e) => {setConfirmPin(e.target.value.replace(/\D/g, ''));
                  if (e.target.value.length === 4) {
                    document.getElementById('done').focus();
                    }
                    }
                    }
                maxLength={4}
                placeholder="••••"
                className="pin-input"
                style={{ textAlign: 'center', fontWeight: "bolder", fontSize: "20px", letterSpacing: '1.5rem' }}
                inputMode="numeric"
                autoComplete="off"
              />
              <span onClick={() => setShowConfirmPin(!showConfirmPin)} className="pin-toggle">
                {showConfirmPin ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>
              </Form.Group>
              {error && <p className="text-danger">{error}</p>}
            </Form>
          </Modal.Body>
          <Modal.Footer className='d-flex  align-items-center'>
            <Button variant="secondary" onClick={() => { onHide(); window.location.reload();}}>Cancel</Button>
        {/* <Button variant="secondary" onClick={onHide}>Cancel</Button> */}
        <Button 
          id="done"
          ref={doneButtonRef}
          variant="primary" 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="done-button"
          autoFocus
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


export default PinSetupModal;
