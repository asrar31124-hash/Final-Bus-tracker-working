import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type RealtimeBroadcastPayload = {
  [key: string]: any
}

export function useLiveBusesLocations() {
  const [busesPayloads, setBusesPayloads] = useState<RealtimeBroadcastPayload[]>([])
  const [locationsPayloads, setLocationsPayloads] = useState<RealtimeBroadcastPayload[]>([])
  const channelsRef = useRef<{ buses?: RealtimeChannel; locations?: RealtimeChannel }>({})

  useEffect(() => {
    if (supabase) {
      supabase.realtime.setAuth()
    }
  }, [])

  const subscribeTopics = useMemo(() => {
    return [
      { topic: 'buses' as const, setFn: setBusesPayloads },
      { topic: 'locations' as const, setFn: setLocationsPayloads },
    ]
  }, [])

  useEffect(() => {
    if (!supabase) return;

    const onTopic = async (topic: 'buses' | 'locations', setFn: (p: RealtimeBroadcastPayload[]) => void) => {
      const channel = supabase.channel(topic, { config: { private: true } })
      channel
        .on('broadcast', { event: '*' }, (payload: any) => {
          setFn((prev) => [...prev, payload])
        })
        .subscribe()
      channelsRef.current[topic] = channel as any
    }

    ;(async () => {
      for (const item of subscribeTopics) {
        await onTopic(item.topic, item.setFn as any)
      }
    })()

    return () => {
      if (channelsRef.current.buses) supabase.removeChannel(channelsRef.current.buses)
      if (channelsRef.current.locations) supabase.removeChannel(channelsRef.current.locations)
      channelsRef.current = {}
    }
  }, [subscribeTopics])

  return {
    busesPayloads,
    locationsPayloads,
  }
}
