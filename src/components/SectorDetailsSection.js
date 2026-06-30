import SectorTopo from "@/components/SectorTopo";
import { useAuth } from "@/context/AuthContext";
import CollapsibleText from "./CollapsableText";

// Called from SectorRouteTables
export default function SectorDetailsSection({
  sector,
  children,
  sectorId = null,
}) {

    function getSteepnessIcon(type) {
        return `/icons/${type}.png`;
    }

    function formatOrientation(orientation) {
        const directions = {
            1: "N",
            2: "NØ",
            3: "Ø",
            4: "SØ",
            5: "S",
            6: "SV",
            7: "V",
            8: "NV",
        };

        return directions[orientation] ?? "?";
    }

    const {user} = useAuth();

    return (
        <section className="mt-6 rounded border p-4">
            <div className="grid gap-4 lg:grid-cols-2">

                {/* Left side */}
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold">
                            {sector.name}
                        </h2>
                        
                        {user && (
                            <>
                            {/* Orientation */}
                            {sector.orientation !== null && (
                                
                                <div
                                    className="flex items-center gap-1 text-sm text-gray-600"
                                    title="Orientation"
                                >
                                    <span className="text-lg">🧭</span>

                                    <span>
                                    {formatOrientation(sector.orientation)}
                                    </span>
                                </div>
                            )}

                            {/* Walking time */}
                            {sector.walking_time !== null && (
                                <div
                                    className="flex items-center gap-1 text-sm text-gray-600"
                                    title="Walking time"
                                    >
                                    <span className="text-lg">🚶‍➡️</span>

                                    <span>
                                        {sector.walking_time} min
                                    </span>
                                </div>
                            )}
                            
                            {/* Steepness */}
                            <div className="flex gap-1">
                                {sector.steepness?.map(type => (
                                <img
                                    key={type}
                                    src={getSteepnessIcon(type)}
                                    alt={type}
                                    title={type}
                                    className="h-6 w-6 object-contain"
                                />
                                ))}
                            </div>
                            </>
                        )}
                        
                    </div>

                    <CollapsibleText
                    title="Description"
                    text={sector.description}
                    />

  

                    <div className="mt-4">
                        {children}
                    </div>
                </div>

                {/* Right side */}
                {user && (
                    <div>
                        <h3 className="mb-3 text-lg font-semibold">
                            Topo
                        </h3>

                        <SectorTopo sector={sector} sectorId={sectorId} />
                    </div>
                )}
            </div>
        </section>
  );
}