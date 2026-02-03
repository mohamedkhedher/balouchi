export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-gray-500 mb-2">Total Stores</h2>
                    <p className="text-3xl font-bold">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-gray-500 mb-2">Active Offers</h2>
                    <p className="text-3xl font-bold">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-gray-500 mb-2">Today's Reservations</h2>
                    <p className="text-3xl font-bold">--</p>
                </div>
            </div>
        </div>
    );
}
