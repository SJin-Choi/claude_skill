import { useRef, useEffect } from 'react'
import { Game } from './game/Game'
import { MainScreen } from './game/screens/MainScreen'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const game = new Game(canvasRef.current)
      game.switchScreen(new MainScreen(game))
      game.start()
      return () => game.stop()
    }
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  )
}

export default App
