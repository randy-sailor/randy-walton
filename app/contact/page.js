import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact — Randy Walton',
  description: 'Speaking requests, consulting inquiries, or anything else — let’s start a conversation.',
};

export default function ContactPage() {
  return (
    <div className="page">
      <SiteHeader active="contact" />
      <main className="contact-main">
        <div className="contact-grid">
          <div>
            <div className="page-kicker">CONTACT</div>
            <h1 className="contact-h1">Let&rsquo;s start a conversation.</h1>
            <p className="contact-intro">
              For speaking requests, consulting inquiries, or anything else — complete the form and
              I&rsquo;ll get back to you.
            </p>
            <div className="contact-details">
              <div>
                <div className="contact-detail-label">SPEAKING</div>
                <div className="contact-detail-text">
                  Keynotes and workshops on leadership, culture, and growth.
                </div>
              </div>
              <div>
                <div className="contact-detail-label">CONSULTING</div>
                <div className="contact-detail-text">
                  Strategy and value growth for leaders and entrepreneurs.
                </div>
              </div>
              <div>
                <div className="contact-detail-label">ELSEWHERE</div>
                <div className="contact-elsewhere">
                  <a href="https://www.linkedin.com/in/randywalton">LINKEDIN</a>
                  <a href="http://instagram.com/randywalton">INSTAGRAM</a>
                </div>
              </div>
            </div>
          </div>
          <div className="form-panel">
            <ContactForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
