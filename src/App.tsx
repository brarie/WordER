import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">WordER</h1>
        <p className="text-muted-foreground mb-8">
          Desktop vocabulary learning app with flashcards and test generation
        </p>

        <div className="border rounded-lg p-6">
          <button
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Count: {count}
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            Project setup complete! Ready to build features.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
