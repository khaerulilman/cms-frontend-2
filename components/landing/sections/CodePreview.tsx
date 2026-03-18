export default function CodePreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Code Editor Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-700/50">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-4 text-sm text-slate-400">api-example.js</span>
          </div>
          {/* Code Content */}
          <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
            <pre className="text-slate-300">
              <code>
                {`// Fetch your portfolio data with a simple API call
const response = await fetch(\`${process.env.NEXT_PUBLIC_MAIN_API}/api/v1/projects\`, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const { projects } = await response.json();

// Use your data anywhere!
projects.forEach(project => {
  console.log(project.title, project.description);
});`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
