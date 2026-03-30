import { Metadata } from 'next';
import { DesobstrucaoPhysicsSlice } from '@/components/games/arcade/DesobstrucaoPhysicsSlice';

export const metadata: Metadata = {
  title: 'Desobstrução • Physics Arcade Proof | Hub Jogos',
  description: 'First physics-arcade vertical slice. Impact, breakage, restoration. One loop validation.',
  openGraph: {
    title: 'Desobstrução • Physics Arcade',
    description: 'Impact pleasure test. One tool, one blockage, complete loop.',
    type: 'website',
  },
};

export default function DesobstrucaoPhysicsPage() {
  return (
    <main style={{ padding: '24px', maxWidth: '100vw', background: '#0a1628', minHeight: '100vh' }}>
      <DesobstrucaoPhysicsSlice />

      <section style={{ marginTop: '32px', padding: '24px', background: 'rgba(15, 30, 45, 0.6)', borderRadius: '12px', color: '#cbd5e1' }}>
        <h2 style={{ color: '#93c5fd', marginTop: 0 }}>T113 Desobstrução Proof</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <strong>Objective:</strong> Validate that one tool + one blockage + impact feedback creates satisfying play loop.
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <strong>What's being tested:</strong>
        </p>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>Impact feel: Does the hit register with satisfying visual/haptic?</li>
          <li>Breakage readability: Is concrete destruction clear and understandable?</li>
          <li>Restoration clarity: Do infrastructure glows signal success?</li>
          <li>Mobile UX: Are aim controls responsive on touch?</li>
          <li>Replay desire: Do players want to try again?</li>
        </ul>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <strong>Next:</strong> Runtime capture of key moments (aim ready, impact, restoration) for GIF proof.
        </p>
      </section>
    </main>
  );
}
