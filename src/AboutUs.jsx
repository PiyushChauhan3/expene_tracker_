import background from "./assets/bgc.jpg"
import "./styles/About.css?v=1.2.3"
import { useAuth } from "./AuthContext";

const AboutUs = () => {

  const timelineData = [
    { year: "2023", text: "Launched AI-driven features for smarter financial insights" },
    { year: "2020", text: "Adapted to users needs during the pandemic" },
    { year: "2017", text: "Expanded globally empowering users across regions" },
    { year: "2014", text: "Introduced mobile-friendly tools for on-the-go tracking" },
    { year: "2010", text: "Laid the foundation for revolutionizing finances" },
  ];

  const {isSidebarVisible} = useAuth();


  return (
    <div className={`about-container ${isSidebarVisible ? "sidebar-open" : " "}`}>
     
        <div 
          className={`page-headers py-4 py-md-5 mb-4 mb-md-5 wow fadeIn ${isSidebarVisible ? " sidebar-close" : " "}`}
          data-wow-delay="0.1s"
          
            style={{
              visibility: "visible", 
              animationDelay: "0.1s",  
              backgroundImage: `url(${background})`, 
              backgroundSize: "cover",         
              backgroundPosition: "center",         
              backgroundRepeat: "no-repeat",
            }}
         
        
        >
          <div className="container text-end py-3 py-md-5">
            <h1 className="display-4 responsive-title text-dark mb-3 animated slideInDown">About Us</h1>
          </div>
        </div>
        
        <div className={isSidebarVisible ? "content-shifted" : ""}>
          <div className="container px-3">
            <div className="row g-2">
              <h2 className="fs-1 mb-4 text-center heading">Expense Tracker</h2>

              {/* Feature 1 */}
              <div
                className="col-md-12 col-lg-6  fadeIn text-center "
                data-wow-delay="0.1s"
                style={{ visibility: "visible", animationDelay: "0.1s" }}
              >
                <div className="feature-item border d-flex flex-column align-items-center justify-content-center h-100 p-5">
                  <div
                    className="text-center mb-4"
                    style={{ width: 64, height: 64 }}
                  >
                    <i className="fa-solid fa-file-signature fa-4x clr" />
                  </div>
                  <h5 className="mb-3">Simplified Expense Management</h5>
                  <p className="mb-0">
                    Track and organize your expenses effortlessly, ensuring every penny is accounted for with ease.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                className="col-md-12 col-lg-6  fadeIn text-center "
                data-wow-delay="0.1s"
                style={{ visibility: "visible", animationDelay: "0.1s" }}
              >
                <div className="feature-item border d-flex flex-column align-items-center justify-content-center h-100 p-5">
                  <div
                    className="text-center mb-4"
                    style={{ width: 64, height: 64 }}
                  >
                    <i className="fa-solid fa-pen-to-square fa-4x clr" />
                  </div>
                  <h5 className="mb-3">Versatile Budgeting Tools</h5>
                  <p className="mb-0">
                    Access a range of budgeting tools to plan finances effectively and achieve financial goals.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div
                className="col-md-12 col-lg-6  fadeIn text-center "
                data-wow-delay="0.1s"
                style={{ visibility: "visible", animationDelay: "0.1s" }}
              >
                <div className="feature-item border d-flex flex-column align-items-center justify-content-center h-100 p-5">
                  <div
                    className="text-center mb-4"
                    style={{ width: 64, height: 64 }}
                  >
                    <i className="fa-solid fa-magnifying-glass-dollar fa-4x clr" />
                  </div>
                  <h5 className="mb-3"> Insights & Analytics</h5>
                  <p className="mb-0">
                    Gain insights into spending habits with detailed reports and analytics to make informed financial decisions.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div
                className="col-md-12 col-lg-6 fadeIn text-center"
                data-wow-delay="0.1s"
                style={{ visibility: "visible", animationDelay: "0.1s" }}
              >
                <div className="feature-item border d-flex flex-column align-items-center justify-content-center h-100 p-5">
                  <div
                    className="text-center mb-4"
                    style={{ width: 64, height: 64 }}
                  >
                    <i className="fa-solid fa-lightbulb fa-4x clr" />
                  </div>
                  <h5 className="mb-3">Secure & Reliable</h5>
                  <p className="mb-0">
                    Your financial data is protected with top-notch security features, ensuring privacy and reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="timeline-section">
            <div className="timeline-wrapper">
              <h2 className="timeline-title">Our Journey</h2>
              <div className="timeline-content">
                {/* Timeline line */}
                <div className="timeline-line"></div>

                <div className="timeline-events">
                  {timelineData.map((item, index) => (
                    <div
                      key={index}
                      className={`timeline-event ${index % 2 === 0 ? 'left' : 'right'}`}
                    >
                      <div className="timeline-dot"></div>
                      <div className="timeline-box">
                        <h3 className="timeline-year">{item.year}</h3>
                        <p className="timeline-text">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
    </div>
  );
};

export default AboutUs;






















