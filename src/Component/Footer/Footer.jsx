import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./Footer.css?v=2.4.4.4";

const Footer = () => {
  const { isSidebarVisible } = useAuth();

  return (
    <div className="footer">
      <footer className="footer d-flex text-center text-sm-start d-print-none">
        <div className="footer-container">
          <div className="row">
            <div className="col-12">
              <div className="footer-card">
                <div
                  className="footer-content card-body"
                >
                  <p className="footer-text">
                    ©2025 Expense Tracker
                    <span className="designer-text text-light d-sm-inline-block float-end">
                     
                      <Link style={{
                        color: "white",
                        textDecoration: "none",
                      }} to={"https://www.gnhub.com/default.aspx"} target="_blank">
                         Design by
                         <i className="iconoir-heart-solid heart-icon align-middle" />
                        GN HUB
                      </Link>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
