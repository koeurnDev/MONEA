import React from 'react';
import { useOptimizedDashboard } from '@/hooks/useOptimizedData';

export function OptimizedDashboard() {
    // មួយ hook នេះជំនួស calls ច្រើន: /auth/me + /broadcast + /wedding/stats
    const { 
        user, 
        wedding, 
        broadcasts, 
        stats, 
        loading, 
        error, 
        refresh 
    } = useOptimizedDashboard({
        refreshInterval: 5 * 60 * 1000, // 5 minutes  
        onError: (error) => {
            console.error('Dashboard error:', error);
            // Handle error (toast notification, etc.)
        }
    });

    if (loading && !user) {
        return <div>កំពុងផ្ទុក...</div>;
    }

    if (error && !user) {
        return (
            <div className="error-state">
                <p>មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>
                <button onClick={refresh}>ព្យាយាមម្តងទៀត</button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>សួស្តី {user?.name}!</h1>
                {loading && <div className="loading-indicator">កំពុងបន្ទាន់សម័យ...</div>}
            </div>

            {/* Wedding Info */}
            {wedding && (
                <div className="wedding-card">
                    <h2>{wedding.groomName} & {wedding.brideName}</h2>
                    <p>កាលបរិច្ឆេទ៖ {new Date(wedding.date).toLocaleDateString('km-KH')}</p>
                    <p>ទីកន្លែង៖ {wedding.location}</p>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>ភ្ញៀវ</h3>
                    <p className="stat-number">{stats.totalGuests || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>សារពាក្យពរ</h3>
                    <p className="stat-number">{stats.totalGuestbookEntries || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>អំណោយ</h3>
                    <p className="stat-number">{stats.totalGifts || 0}</p>
                </div>
            </div>

            {/* Broadcasts/Announcements */}
            {broadcasts.length > 0 && (
                <div className="announcements">
                    <h3>ប្រកាស</h3>
                    {broadcasts.map((broadcast: any) => (
                        <div key={broadcast.id} className="announcement-card">
                            <h4>{broadcast.title}</h4>
                            <p>{broadcast.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Manual Refresh Button */}
            <button 
                onClick={refresh} 
                disabled={loading}
                className="refresh-button"
            >
                {loading ? 'កំពុងបន្ទាន់សម័យ...' : 'បន្ទាន់សម័យ'}
            </button>
        </div>
    );
}

export default OptimizedDashboard;