import { useState } from "react";
import { Button, Form, Input } from "antd";
import { TrustNote, TrustPageShell, TrustSection } from "../components/TrustPageShell";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  function onFinish(values) {
    setLoading(true);
    const subject = encodeURIComponent(`[EDER] ${values.subject}`);
    const body = encodeURIComponent(
      `Ad Soyad: ${values.name}\nE-posta: ${values.email}\n\n${values.message}`
    );
    window.location.href = `mailto:destek@ederapp.com?subject=${subject}&body=${body}`;
    window.setTimeout(() => setLoading(false), 500);
  }

  return (
    <TrustPageShell
      eyebrow="İLETİŞİM"
      title="Bize yazın."
      lead="Destek, ürün geri bildirimi, veri talebi veya teknik bir sorun için EDER'e e-posta üzerinden ulaşabilirsiniz."
      asideTitle="Tek iletişim noktası"
      asideText="destek@ederapp.com üzerinden iletilen talepler, konusuna göre değerlendirilir."
    >
      <TrustSection number="01" title="E-posta">
        <p>
          <a className="contact-mail-link" href="mailto:destek@ederapp.com">
            destek@ederapp.com
          </a>
        </p>
        <p>
          Yanıt süresi talebin kapsamına, kimlik doğrulama ihtiyacına ve teknik
          inceleme gerekip gerekmediğine göre değişebilir.
        </p>
      </TrustSection>

      <TrustSection number="02" title="Mesaj taslağı oluşturun">
        <Form layout="vertical" requiredMark={false} onFinish={onFinish}>
          <div className="contact-form-grid">
            <Form.Item
              name="name"
              label="Ad Soyad"
              rules={[{ required: true, message: "Ad Soyad gerekli" }]}
            >
              <Input size="large" autoComplete="name" />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: "E-posta gerekli" },
                { type: "email", message: "Geçerli e-posta girin" },
              ]}
            >
              <Input size="large" autoComplete="email" />
            </Form.Item>
          </div>

          <Form.Item
            name="subject"
            label="Konu"
            rules={[{ required: true, message: "Konu gerekli" }]}
          >
            <Input size="large" placeholder="Örn. Değerleme / Hesap / Veri talebi" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Mesaj"
            rules={[
              { required: true, message: "Mesaj gerekli" },
              { min: 10, message: "Mesaj en az 10 karakter olmalı" },
            ]}
          >
            <Input.TextArea rows={7} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="contact-submit"
          >
            E-posta taslağını aç
          </Button>
        </Form>

        <TrustNote title="Nasıl çalışır?">
          Form bilgileri EDER sunucusuna gönderilmez; cihazınızdaki e-posta
          uygulamasında bir taslak oluşturmak için kullanılır. Mesajı siz
          gönderirsiniz.
        </TrustNote>
      </TrustSection>
    </TrustPageShell>
  );
}
