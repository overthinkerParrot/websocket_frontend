"use client"

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MAX_DATA_POINTS = 20

type DataPoint = {
  time: string
  cpu: number
  memory: number
}

const WS_URL = process.env.NEXT_PUBLIC_API_URL

export default function SystemMetrics() {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<null | WebSocket>(null);

  const connect = ()=>{
    const ws = new WebSocket(WS_URL);
    ws.onopen = ()=>{
        setLoading(false);
        wsRef.current = ws;
        ws.send(JSON.stringify({type: 'benchmark'}))
        setLoading(false);
    }
    ws.onmessage = (message)=>{
        try{
            const data = JSON.parse(message.data);
            console.log('Received data:', data.data);
            setData((currentData)=>{
                const newDataPoint: DataPoint = {
                    time: new Date().toLocaleTimeString(),
                    cpu: data.data.cpu,
                    memory: data.data.memory
                }
                const newData = [...currentData, newDataPoint];
                if(newData.length > MAX_DATA_POINTS){
                    newData.shift();
                }
                return newData;
            })
        }catch(error){
            console.error('Failed to parse WebSocket message:', error)
        }
    }
    ws.onclose = ()=>{
        wsRef.current = null;
    }
  }

  useEffect(() => {
    connect();
  }, [])


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Metrics</h1>
      {!loading?(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value.split(':')[1]}
                />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}   
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value.split(':')[1]}
                />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="memory" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      ):(
        <div>Loading...</div>
      )}
      
    </div>
  )
}