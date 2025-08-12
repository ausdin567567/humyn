"use client";

import { useEffect, useRef, useState } from "react";
import {
    StreamTheme,
    useCall,
    useCallStateHooks,
    CallingState
} from "@stream-io/video-react-sdk";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {meetingName: string;}

export const CallUI = ({ meetingName }: Props) => {
    const call = useCall();
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  // Prevent double-joins (double click / fast re-trigger)
    const joiningRef = useRef(false);

    const handleJoin = async () => {
        if (!call) return;

        if (joiningRef.current ||
            callingState === CallingState.JOINING ||
            callingState === CallingState.JOINED) {
        // already in/entering the call; just show it
                setShow("call");
                return;
        }

    joiningRef.current = true;
    try {
        await call.join({ create: true });
        setShow("call");
        } finally {
        joiningRef.current = false;
        }
    };

    const handleLeave = async () => {
        if (!call) return;
        try {
        await call.leave();          // leave just this user
        } catch (e) {
        console.error("leave failed", e);
        } finally {
        setShow('ended');
        }
    };

    useEffect(() => {
    if (callingState === CallingState.LEFT) {
        setShow("ended");
        }
    }, [callingState]);

    return (
        <StreamTheme className="h-full">
        {show === "lobby" && <CallLobby onJoin={handleJoin} />}
        {show === "call" && (
            <CallActive onLeave={handleLeave} meetingName={meetingName} />
        )}
        {show === "ended" && <CallEnded />}
        </StreamTheme>
    );
    };
