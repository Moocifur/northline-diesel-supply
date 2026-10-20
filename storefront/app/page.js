// storefront/app/page.js
import Hero from './components/Hero'
import Features from './components/Features'
import TechStack from './components/TechStack'
import Contact from './components/Contact'
import Form from './components/Form'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <TechStack />
      <Contact />
      <Form />
    </>
  )
}