import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../utils/authUtils';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const LogoutHandler = async () => {
        try {
            // Call the logout utility function with user type for proper redirection
            await logoutUser(navigate, user?.type);
            
            // Update the auth context
            logout();
            
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <button onClick={LogoutHandler} className="flex items-center px-4">
            <span><strong>Logout</strong></span>
        </button>
    );
};

export default LogoutButton;
