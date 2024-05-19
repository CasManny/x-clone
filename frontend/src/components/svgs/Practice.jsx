import React from "react";
import { Link } from "react-router-dom";

const Practice = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullname: "",
    password: "",
    username: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          <button>font</button>
          <input
            type="email"
            placeholder="email"
            name="email"
            value={formData.email}
            onChange={handleOnChange}
          />
        </label>
      </form>
      <div className="flex">
        <Link to={'/login'}>
          <button>Sign In</button>
        </Link>
      </div>
    </div>
  );
};

export default Practice;
