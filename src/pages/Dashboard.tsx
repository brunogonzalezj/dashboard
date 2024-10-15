import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { userRole } = useAuth();


    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Datos de Usuarios</h1>
            {userRole === 'admin' ? (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Datos de todos los usuarios</h2>
                    {/* Mostrar datos para admin */}
                </div>
            ) : (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Tus datos</h2>
                    {/* Mostrar datos filtrados para cliente */}
                </div>
            )}
            <table className="min-w-full bg-white">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b">Column 1</th>
                    <th className="py-2 px-4 border-b">Column 2</th>
                    <th className="py-2 px-4 border-b">Column 3</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-2 px-4 border-b">item1</td>
                        <td className="py-2 px-4 border-b">item2</td>
                        <td className="py-2 px-4 border-b">item3</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;