// React component to test client filtering
import React, { useState } from 'react';
import { useEnhancedAuth } from '../../contexts/useEnhancedAuth';
import { clientsService } from '../../services/clientsService';
import type { ClientData } from '../../services/clientsService';

const TestClientsFiltering: React.FC = () => {
    const { user } = useEnhancedAuth();
    const [testResults, setTestResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        if (!user) {
            alert('Please log in as a tour guide first');
            return;
        }

        setLoading(true);
        try {
            console.log('Testing client filtering for user:', user);

            // Test 1: Get clients by user ID
            const clientsResult = await clientsService.getClientsByTourGuideUserId(user.id, {
                page: 1,
                limit: 10
            });

            // Test 2: Get client stats
            const statsResult = await clientsService.getClientStatsByUserId(user.id);

            const results = {
                userId: user.id,
                userRole: user.role,
                clientsCount: clientsResult.clients?.length || 0,
                totalClients: clientsResult.total || 0, clients: clientsResult.clients?.slice(0, 3).map((c: any) => ({
                    name: c.name,
                    email: c.email,
                    totalBookings: c.totalBookings,
                    status: c.status
                })) || [],
                stats: statsResult,
                success: true
            };

            setTestResults(results);
            console.log('Test Results:', results);

        } catch (error) {
            console.error('Test failed:', error);
            setTestResults({
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>Client Filtering Test</h2>

            {user ? (
                <div>
                    <p><strong>Current User:</strong> {(user as any).first_name} {(user as any).last_name} ({(user as any).role})</p>
                    <p><strong>User ID:</strong> {user.id}</p>

                    <button
                        onClick={runTest}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: loading ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Testing...' : 'Run Client Filtering Test'}
                    </button>

                    {testResults && (
                        <div style={{ marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
                            <h3>Test Results:</h3>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                {JSON.stringify(testResults, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            ) : (
                <p>Please log in as a tour guide to run this test.</p>
            )}
        </div>
    );
};

export default TestClientsFiltering;
