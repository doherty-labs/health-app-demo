import { useEffect, useMemo, useState } from "react";
import { components } from "../../schemas/api-types";
type AvailabilityType = components["schemas"]["Availability"];

interface PracticeAvailabilityProps {
  practiceId?: number;
  updateCallback: (avail: AvailabilityType) => void;
}

export function usePracticeAvailabilityEvents({
  practiceId,
  updateCallback,
}: PracticeAvailabilityProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!practiceId) {
      return;
    }
    const api_url = process.env.NEXT_PUBLIC_API_URL || "";
    let host = api_url.split("/")[2];
    if (host === "rest-api:8000") {
      host = "localhost:8000";
    }
    const websocket_url = "ws://" + host + "/";
    if (ws === null) {
      const socket = new WebSocket(
        websocket_url + `practice/${practiceId}/availability`,
      );
      setWs(socket);
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [practiceId, ws, updateCallback]);

  useMemo(() => {
    if (!ws) {
      return;
    }
    ws.onmessage = (event) => {
      const parsedEvent: AvailabilityType = JSON.parse(event.data);
      updateCallback(parsedEvent);
    };

    ws.onclose = () => {
      setWs(null);
    };
  }, [updateCallback, ws]);
}
