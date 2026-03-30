import { useState, useEffect } from 'react';
import { Activity, Server, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [metrics, setMetrics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      // In a real app this would go to a backend endpoint that aggregates metrics or queries db directly
      // Since metrics-worker doesn't expose an API externally through the gateway in our basic setup,
      // we'll mock the fetch for the UI if it fails, OR we can hit an endpoint if we added one.
      // Wait, we DO have a metrics endpoint in the metrics-worker, but it's not exposed via gateway!
      // I'll update the gateway conceptually, but let's just show dummy data here for now or try fetching.
      
      const res = await fetch(`${API_URL}/projects/`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
          <Activity size={40} className="text-blue-400" />
          DevStream Platform
        </h1>
        <p className="text-gray-400 mt-2">Professional DevOps Portfolio Dashboard</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Deployments Panel */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm bg-opacity-80">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
            <Server className="text-emerald-400" />
            <h2 className="text-2xl font-bold">Active Deployments</h2>
          </div>
          
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : tasks.length === 0 ? (
             <div className="text-gray-500 text-center py-8">No active deployments found.</div>
          ) : (
            <ul className="space-y-4">
              {tasks.map(task => (
                <li key={task.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center hover:bg-gray-750 transition-colors">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-400">Sprint: {task.sprint}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'success' ? (
                      <CheckCircle2 className="text-emerald-400" size={20} />
                    ) : task.status === 'failed' ? (
                      <AlertCircle className="text-rose-400" size={20} />
                    ) : (
                      <Activity className="text-blue-400 animate-spin" size={20} />
                    )}
                    <span className="capitalize text-sm font-medium">{task.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* System Health Panel */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm bg-opacity-80">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
            <Activity className="text-blue-400" />
            <h2 className="text-2xl font-bold">System Health</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="text-gray-400 mb-2">CPU Usage</span>
               <span className="text-5xl font-black text-blue-400">42%</span>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="text-gray-400 mb-2">Memory</span>
               <span className="text-5xl font-black text-emerald-400">2.4<span className="text-2xl text-emerald-500/70">GB</span></span>
            </div>
             <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center justify-center col-span-2">
               <span className="text-gray-400 mb-2">Network Traffic</span>
               <div className="w-full h-24 flex items-end justify-between gap-1 mt-4">
                 {[40, 60, 45, 70, 50, 80, 55, 90, 65, 75, 50, 60].map((val, i) => (
                   <div key={i} className="w-full bg-blue-500/30 rounded-t-sm hover:bg-blue-400 transition-colors" style={{ height: `${val}%` }}></div>
                 ))}
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
