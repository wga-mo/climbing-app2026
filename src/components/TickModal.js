
export default function TickModal({
  selectedRoute,
  selectedRouteTicks,
  tickDate,
  setTickDate,
  tickType,
  setTickType,
  note,
  setNote,
  onCancel,
  onSubmit,
}) {
  if (!selectedRoute) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded bg-white p-4 shadow-lg">
            {selectedRoute && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded bg-white p-4 shadow-lg">
            <h2 className="text-xl font-semibold">
              Tick route
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {selectedRoute.name}
            </p>

        <section className="mt-4">
          <h3 className="font-semibold">Past ticks</h3>

          {selectedRouteTicks.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No ticks yet.
            </p>
          ) : (
            <ul className="mt-2 max-h-40 overflow-y-auto space-y-2">
              {selectedRouteTicks.map(tick => (
                <li
                  key={tick.tick_id}
                  className="rounded border p-2 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">
                      {tick.tick_date}
                    </span>

                    <span>
                      {tick.tick_type}
                    </span>
                  </div>

                  {tick.note && (
                    <p className="mt-1 text-gray-600">
                      {tick.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Date
            <input
              type="date"
              value={tickDate}
              onChange={(e) => setTickDate(e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>

          <label className="block text-sm">
            Type
            <select
              value={tickType}
              onChange={(e) => setTickType(e.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="climbed">Climbed</option>
              <option value="onsight">Onsight</option>
              <option value="flash">Flash</option>
              <option value="redpoint">Redpoint</option>
              <option value="attempt">Attempt</option>
              <option value="repeat">Repeat</option>
            </select>
          </label>

          <label className="block text-sm">
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              rows="3"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border px-3 py-1 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="rounded bg-black px-3 py-1 text-sm text-white"
          >
            Save tick
          </button>
        </div>
      </div>
    </div>
    )}

        
      </div>
    </div>
  );
}