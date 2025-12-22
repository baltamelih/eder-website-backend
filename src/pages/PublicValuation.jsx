import { useEffect, useState } from "react";
import { Button, Card, Col, Form, InputNumber, Row, Select, Space, Typography, message } from "antd";
import { apiFetch } from "../services/api";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function ValuationPublic() {
  const nav = useNavigate();
  const { isAuthed } = useAuth();
  
  const [loading, setLoading] = useState(false);

  // dropdown data
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [trims, setTrims] = useState([]);

  // selected ids
  const [brandId, setBrandId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [year, setYear] = useState(null);
  const [trimId, setTrimId] = useState(null);

  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await apiFetch("/api/brands");
      setBrands(data.items || data || []);
    })().catch(() => message.error("Markalar yüklenemedi"));
  }, []);

  async function loadModels(bid) {
    const data = await apiFetch(`/api/models?brand_id=${bid}`);
    setModels(data.items || data || []);
  }

  async function loadYears(bid, mid) {
    const data = await apiFetch(`/api/years?brand_id=${bid}&model_id=${mid}`);
    setYears(data.items || data || []);
  }

  async function loadTrims(bid, mid, y) {
    const data = await apiFetch(`/api/trims?brand_id=${bid}&model_id=${mid}&year=${y}`);
    setTrims(data.items || data || []);
  }

  async function onFinish(values) {
    setLoading(true);
    try {
      // Senin backend /api/predict bekliyor:
      // year, km + brand_id/model_id/trim_id vb.
      const payload = {
        brand_id: brandId,
        model_id: modelId,
        year,
        trim_id: trimId,
        km: values.km,
      };

      const data = await apiFetch("/api/predict", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setResult(data);
      message.success("Değerleme hazır");
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  

async function saveToAccount() {
  if (!isAuthed) {
    nav("/login?from=valuation");
    return;
  }

  if (!brandId || !modelId || !year) {
    message.warning("Marka/Model/Yıl seçmelisin.");
    return;
  }

  // seçili isimleri bul
  const brandObj = brands.find((b) => b.id === brandId);
  const modelObj = models.find((m) => m.id === modelId);
  const trimObj = trims.find((t) => t.id === trimId);

  const payload = {
    brand_id: brandId,
    brandname: brandObj?.name || "",
    model_id: modelId,
    modelname: modelObj?.name || "",
    year,
    trim: trimObj?.name || "",
    kilometre: form.getFieldValue("km") || null, // Form instance varsa
  };

  try {
        await UserCarsAPI.upsert(payload);
        message.success("Araç kaydedildi");
        } catch (e) {
        if (e.message.includes("limitine ulaştın")) {
            message.warning("Free planda araç limiti doldu. Premium’a geçebilirsin.");
            nav("/pricing");
            return;
        }
        message.error(e.message);
        }

}

  return (
    <div>
      <Title level={2} style={{ marginTop: 0 }}>Giriş yapmadan değerleme</Title>
      <Paragraph style={{ maxWidth: 860 }}>
        Marka/model/yıl/trim seç, kilometreyi gir ve tahmini piyasa değerini gör. İstersen giriş yapıp sonucu hesabına kaydedebilirsin.
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 16 }} title="Araç Bilgileri">
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item label="Marka" required>
                <Select
                  placeholder="Marka seç"
                  options={brands.map(b => ({ value: b.id, label: b.name }))}
                  value={brandId}
                  onChange={async (v) => {
                    setBrandId(v);
                    setModelId(null); setYear(null); setTrimId(null);
                    setModels([]); setYears([]); setTrims([]);
                    await loadModels(v);
                  }}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              <Form.Item label="Model" required>
                <Select
                  placeholder="Model seç"
                  disabled={!brandId}
                  options={models.map(m => ({ value: m.id, label: m.name }))}
                  value={modelId}
                  onChange={async (v) => {
                    setModelId(v);
                    setYear(null); setTrimId(null);
                    setYears([]); setTrims([]);
                    await loadYears(brandId, v);
                  }}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              <Form.Item label="Yıl" required>
                <Select
                  placeholder="Yıl seç"
                  disabled={!modelId}
                  options={years.map(y => ({ value: y, label: String(y) }))}
                  value={year}
                  onChange={async (v) => {
                    setYear(v);
                    setTrimId(null);
                    setTrims([]);
                    await loadTrims(brandId, modelId, v);
                  }}
                />
              </Form.Item>

              <Form.Item label="Trim / Donanım" required>
                <Select
                  placeholder="Trim seç"
                  disabled={!year}
                  options={trims.map(t => ({ value: t.id, label: t.name }))}
                  value={trimId}
                  onChange={(v) => setTrimId(v)}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>

              <Form.Item name="km" label="KM" rules={[{ required: true, message: "KM gerekli" }]}>
                <InputNumber style={{ width: "100%" }} placeholder="Örn: 120000" min={0} step={1000} />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={loading} disabled={!trimId}>
                  Değerle
                </Button>
                <Button onClick={saveToAccount}>
                  {isAuthed ? "Hesabıma Kaydet" : "Giriş Yapıp Kaydet"}
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 16 }} title="Sonuç">
            {!result ? (
              <Text type="secondary">Değerleme sonucu burada görünecek.</Text>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <Card style={{ borderRadius: 14 }}>
                  <Text type="secondary">Tahmin</Text>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{JSON.stringify(result)}</div>
                </Card>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
