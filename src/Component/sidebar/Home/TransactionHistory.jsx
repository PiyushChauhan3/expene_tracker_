import React from 'react'

const Employeeprofile = () => {
  return (
    <div style={{marginLeft:"300px" , paddingTop:"80px"}}>

<div className="card">
  <div className="card-header">
    <div className="row align-items-center">
      <div className="col">
        <h4 className="card-title">Transaction History</h4>
        <div className="">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="#" className="fs-5">Profile</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" className="fs-5"></a>
                </li>
                
              </ol>
            </div>
      </div>
      {/*end col*/}
      <div className="col-auto">
        <div className="dropdown">
          <a
            href="#"
            className="btn bt btn-light dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className="icofont-calendar fs-5 me-1" /> This Month
            <i className="las la-angle-down ms-1" />
          </a>
          <div className="dropdown-menu dropdown-menu-end" style={{}}>
            <a className="dropdown-item" href="#">
              Today
            </a>
            <a className="dropdown-item" href="#">
              Last Week
            </a>
            <a className="dropdown-item" href="#">
              Last Month
            </a>
            <a className="dropdown-item" href="#">
              This Year
            </a>
          </div>
        </div>
      </div>
      {/*end col*/}
    </div>{" "}
    {/*end row*/}
  </div>
  {/*end card-header*/}
  <div className="card-body pt-0">
    <div className="table-responsive">
      <table className="table mb-0">
        <thead className="table-light">
          <tr>
            <th className="border-top-0">Transaction</th>
            <th className="border-top-0">Date</th>
            <th className="border-top-0">AApprox</th>
            <th className="border-top-0">Status</th>
            <th className="border-top-0">Action</th>
          </tr>
          {/*end tr*/}
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="d-flex align-items-center">
                <img
                  src="assets/images/logos/lang-logo/chatgpt.png"
                  height={40}
                  className="me-3 align-self-center rounded"
                  alt="..."
                />
                <div className="flex-grow-1 text-truncate">
                  <h6 className="m-0">Chat Gpt</h6>
                  <a href="#" className="fs-12 text-primary">
                    ID: A3652
                  </a>
                </div>
                {/*end media body*/}
              </div>
            </td>
            <td>20 july 2024</td>
            <td>$560</td>
            <td>
              <span className="badge bg-success-subtle text-success fs-11 fw-medium px-2">
                Successful
              </span>
            </td>
            <td>
              <a href="#">
                <i className="las la-print text-secondary fs-18" />
              </a>
              <a href="#">
                <i className="las la-trash-alt text-secondary fs-18" />
              </a>
            </td>
          </tr>
          {/*end tr*/}
          <tr>
            <td>
              <div className="d-flex align-items-center">
                <img
                  src="assets/images/logos/lang-logo/gitlab.png"
                  height={40}
                  className="me-3 align-self-center rounded"
                  alt="..."
                />
                <div className="flex-grow-1 text-truncate">
                  <h6 className="m-0">Gitlab</h6>
                  <a href="#" className="fs-12 text-primary">
                    ID: B5784
                  </a>
                </div>
                {/*end media body*/}
              </div>
            </td>
            <td>09 July 2024</td>
            <td>$2350</td>
            <td>
              <span className="badge bg-warning-subtle text-warning fs-11 fw-medium px-2">
                Pending
              </span>
            </td>
            <td>
              <a href="#">
                <i className="las la-print text-secondary fs-18" />
              </a>
              <a href="#">
                <i className="las la-trash-alt text-secondary fs-18" />
              </a>
            </td>
          </tr>
          {/*end tr*/}
          <tr>
            <td>
              <div className="d-flex align-items-center">
                <img
                  src="assets/images/logos/lang-logo/nextjs.png"
                  height={40}
                  className="me-3 align-self-center rounded"
                  alt="..."
                />
                <div className="flex-grow-1 text-truncate">
                  <h6 className="m-0">Nextjs</h6>
                  <a href="#" className="fs-12 text-primary">
                    ID: C9632
                  </a>
                </div>
                {/*end media body*/}
              </div>
            </td>
            <td>02 June 2024</td>
            <td>$2200</td>
            <td>
              <span className="badge bg-success-subtle text-success fs-11 fw-medium px-2">
                Successful
              </span>
            </td>
            <td>
              <a href="#">
                <i className="las la-print text-secondary fs-18" />
              </a>
              <a href="#">
                <i className="las la-trash-alt text-secondary fs-18" />
              </a>
            </td>
          </tr>
          {/*end tr*/}
          <tr>
            <td>
              <div className="d-flex align-items-center">
                <img
                  src="assets/images/logos/lang-logo/vue.png"
                  height={40}
                  className="me-3 align-self-center rounded"
                  alt="..."
                />
                <div className="flex-grow-1 text-truncate">
                  <h6 className="m-0">Vue</h6>
                  <a href="#" className="fs-12 text-primary">
                    ID: D8596
                  </a>
                </div>
                {/*end media body*/}
              </div>
            </td>
            <td>28 MAY 2024</td>
            <td>$1320</td>
            <td>
              <span className="badge bg-danger-subtle text-danger fs-11 fw-medium px-2">
                Cancle
              </span>
            </td>
            <td>
              <a href="#">
                <i className="las la-print text-secondary fs-18" />
              </a>
              <a href="#">
                <i className="las la-trash-alt text-secondary fs-18" />
              </a>
            </td>
          </tr>
          {/*end tr*/}
          <tr>
            <td>
              <div className="d-flex align-items-center">
                <img
                  src="assets/images/logos/lang-logo/symfony.png"
                  height={40}
                  className="me-3 align-self-center rounded"
                  alt="..."
                />
                <div className="flex-grow-1 text-truncate">
                  <h6 className="m-0">Symfony</h6>
                  <a href="#" className="fs-12 text-primary">
                    ID: E7778
                  </a>
                </div>
                {/*end media body*/}
              </div>
            </td>
            <td>15 May 2024</td>
            <td>$3650</td>
            <td>
              <span className="badge bg-success-subtle text-success fs-11 fw-medium px-2">
                Successful
              </span>
            </td>
            <td>
              <a href="#">
                <i className="las la-print text-secondary fs-18" />
              </a>
              <a href="#">
                <i className="las la-trash-alt text-secondary fs-18" />
              </a>
            </td>
          </tr>
          {/*end tr*/}
        </tbody>
      </table>{" "}
      {/*end table*/}
    </div>
    {/*end /div*/}
  </div>
  {/*end card-body*/}
</div>

    
    
        </div>
  )
}

export default Employeeprofile
