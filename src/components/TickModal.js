export default function TickModal({
  selectedRoute,
  selectedRouteTicks,
  tickDate,
  setTickDate,
  tickType,
  setTickType,
  belayer,
  setBelayer,
  note,
  setNote,
  editingTickId,
  onEditTick,
  onCancelEdit,
  onClose,
  onSubmit,
}) {
  if (!selectedRoute) return null;

  const previousBelayers = [
    ...new Set(
      selectedRouteTicks
        .map(tick => tick.belayer)
        .filter(Boolean)
    ),
  ];

  const ticksByDate = selectedRouteTicks.reduce((groups, tick) => {
    if (!groups[tick.tick_date]) {
      groups[tick.tick_date] = [];
    }

    groups[tick.tick_date].push(tick);
    return groups;
  }, {});

  return (
    <div 
    onClick={onClose}
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div 
      onClick={(e) => e.stopPropagation()}
      className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-lg">
        
        {/* Header */}
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">
            {editingTickId ? "Edit tick" : "Tick route"}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {selectedRoute.name}
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4">
          
          {/* Past ticks */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Past ticks
            </h3>

            {selectedRouteTicks.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">
                No ticks yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {Object.entries(ticksByDate).map(([date, ticks]) => {
                  const successfulTicks = ticks.filter(
                    tick => tick.tick_type !== "attempt"
                  );

                  const attempts = ticks.filter(
                    tick => tick.tick_type === "attempt"
                  );

                  return (
                    <div
                      key={date}
                      className="rounded-md border bg-gray-50 p-3"
                    >
                      <div className="mb-2 font-medium">
                        {date}
                      </div>

                      <div className="space-y-2">
                        {successfulTicks.map(tick => (
                          <TickItem
                            key={tick.tick_id}
                            tick={tick}
                            isEditing={editingTickId === tick.tick_id}
                            isEditMode={!!editingTickId}
                            onEditTick={onEditTick}
                          />
                        ))}

                        {attempts.length > 0 && (
                          <div className="mt-2 rounded border border-dashed bg-white p-2">
                            <div className="mb-1 text-xs font-semibold uppercase text-gray-500">
                              Attempts
                            </div>

                            <div className="space-y-2">
                              {attempts.map(tick => (
                                <TickItem
                                  key={tick.tick_id}
                                  tick={tick}
                                  isEditing={editingTickId === tick.tick_id}
                                  isEditMode={!!editingTickId}
                                  onEditTick={onEditTick}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Form */}
          <section className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {editingTickId ? "Edit details" : "New tick"}
            </h3>

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
                <option value="repeat">Repeat</option>
                <option value="attempt">Attempt</option>
              </select>
            </label>

            <label className="block text-sm">
              Belayer
              <input
                list="previous-belayers"
                value={belayer}
                onChange={(e) => setBelayer(e.target.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder="Optional"
              />

              <datalist id="previous-belayers">
                {previousBelayers.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>

            <label className="block text-sm">
              Note
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded border p-2"
                rows="3"
                placeholder="Optional"
              />
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t p-4">
          {editingTickId ? (
            <button
              onClick={onCancelEdit}
              className="rounded border px-3 py-2 text-sm hover:bg-gray-100"
            >
              Cancel edit
            </button>
          ) : (
            <button
              onClick={onClose}
              className="rounded border px-3 py-2 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onSubmit}
            className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
          >
            {editingTickId ? "Update tick" : "Save tick"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TickItem({
  tick,
  isEditing,
  isEditMode,
  onEditTick,
}) {
  return (
    <div
      className={`
        rounded bg-white p-2 text-sm transition
        ${
          isEditing
            ? "ring-2 ring-black opacity-100"
            : isEditMode
              ? "border opacity-40"
              : "border opacity-100"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-medium capitalize">
              {tick.tick_type}
            </span>

            {tick.belayer && (
              <>
                <span className="text-gray-400">
                  •
                </span>

                <span className="truncate text-gray-600">
                  {tick.belayer}
                </span>
              </>
            )}
          </div>

          {tick.note && (
            <p className="mt-0.5 text-xs text-gray-500">
              {tick.note}
            </p>
          )}
        </div>

        <button
          onClick={() => onEditTick(tick)}
          disabled={isEditMode && !isEditing}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-default disabled:opacity-30"
          title="Edit tick"
        >
          ✏️
        </button>
      </div>
    </div>
  );
}