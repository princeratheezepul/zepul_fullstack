import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

export const getRecruiterFromToken = () => {
  const token = Cookies.get('recruiterToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    console.error('Token decode failed:', err);
    return null;
  }
};
