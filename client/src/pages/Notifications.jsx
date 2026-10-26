export default function Notifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <div className="space-y-4">
        {[
          { title: 'Shipment Approved', message: 'Your shipment "Electronics Batch A" has been approved by AI compliance.', time: '2 hours ago', type: 'success' },
          { title: 'New Alert', message: 'Documentation missing for shipment "Hazardous Cargo".', time: '5 hours ago', type: 'warning' },
        ].map((notif, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{notif.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{notif.message}</p>
              </div>
              <span className="text-xs text-slate-400">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
