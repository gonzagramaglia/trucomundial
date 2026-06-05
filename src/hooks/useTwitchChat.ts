import { useState, useEffect, useCallback, useRef } from 'react';
import tmi from 'tmi.js';

export type TwitchCommand = 
  | 'carta_1' 
  | 'carta_2' 
  | 'carta_3' 
  | 'truco' 
  | 'retruco' 
  | 'vale_cuatro' 
  | 'envido' 
  | 'real_envido' 
  | 'falta_envido' 
  | 'quiero' 
  | 'no_quiero' 
  | 'me_voy';

export function useTwitchChat(channel: string | null) {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const activeUserRef = useRef<string | null>(null);
  const [lastCommand, setLastCommand] = useState<{ command: TwitchCommand, timestamp: number } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const clearActiveUser = useCallback(() => {
    setActiveUser(null);
    activeUserRef.current = null;
  }, []);

  const forceActiveUser = useCallback((username: string) => {
    setActiveUser(username);
    activeUserRef.current = username;
  }, []);

  useEffect(() => {
    if (!channel) return;

    setConnectionStatus('connecting');
    const client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true
      },
      channels: [channel]
    });

    client.connect().then(() => {
      setConnectionStatus('connected');
    }).catch(console.error);

    client.on('message', (_msgChannel, tags, message, self) => {
      if (self) return;

      const username = tags.username;
      if (!username) return;

      const msg = message.trim().toLowerCase();

      // Ensure it's a command
      if (!msg.startsWith('!')) return;

      // Handle seat reservation
      if (msg === '!jugar' || msg === '!truco' || msg.startsWith('!carta')) {
        if (activeUserRef.current === null) {
          console.log(`[Twitch] ${username} tomó el control de la ronda.`);
          activeUserRef.current = username;
          setActiveUser(username);
        }
      }

      if (activeUserRef.current === username) {
        let parsedCmd: TwitchCommand | null = null;
        
        switch (msg) {
          case '!carta 1':
          case '!carta1':
            parsedCmd = 'carta_1';
            break;
          case '!carta 2':
          case '!carta2':
            parsedCmd = 'carta_2';
            break;
          case '!carta 3':
          case '!carta3':
            parsedCmd = 'carta_3';
            break;
          case '!truco':
            parsedCmd = 'truco';
            break;
          case '!retruco':
            parsedCmd = 'retruco';
            break;
          case '!valecuatro':
          case '!vale cuatro':
            parsedCmd = 'vale_cuatro';
            break;
          case '!envido':
            parsedCmd = 'envido';
            break;
          case '!realenvido':
          case '!real envido':
            parsedCmd = 'real_envido';
            break;
          case '!faltaenvido':
          case '!falta envido':
            parsedCmd = 'falta_envido';
            break;
          case '!quiero':
            parsedCmd = 'quiero';
            break;
          case '!noquiero':
          case '!no quiero':
            parsedCmd = 'no_quiero';
            break;
          case '!mevoy':
          case '!me voy':
          case '!mazo':
            parsedCmd = 'me_voy';
            break;
        }

        if (parsedCmd) {
          setLastCommand({ command: parsedCmd, timestamp: Date.now() });
        }
      }
    });

    client.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    return () => {
      client.disconnect();
    };
  }, [channel]);

  return { activeUser, clearActiveUser, forceActiveUser, lastCommand, connectionStatus };
}
