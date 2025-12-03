import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Home = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/auth');
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome Home!</h1>
                <p className="text-xl text-gray-600 mb-8">
                    You have successfully logged in.
                </p>

                {user && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Logged in as:</p>
                        <p className="font-medium text-lg">{user.displayName || user.email}</p>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Home;
