import { Skeleton, Card } from 'antd';

export function BlogPostSkeleton() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Skeleton.Input style={{ width: '60%', height: 40, marginBottom: 16 }} active />
      <Skeleton.Input style={{ width: '40%', height: 20, marginBottom: 24 }} active />
      <Skeleton paragraph={{ rows: 8 }} active />
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {[1, 2, 3].map(i => (
        <Card key={i} style={{ marginBottom: 16 }}>
          <Skeleton.Input style={{ width: '70%', height: 24, marginBottom: 12 }} active />
          <Skeleton paragraph={{ rows: 2 }} active />
          <Skeleton.Input style={{ width: '30%', height: 16 }} active />
        </Card>
      ))}
    </div>
  );
}

export function ValuationSkeleton() {
  return (
    <Card style={{ maxWidth: 600, margin: '0 auto' }}>
      <Skeleton.Input style={{ width: '50%', height: 32, marginBottom: 20 }} active />
      <Skeleton paragraph={{ rows: 4 }} active />
      <Skeleton.Button style={{ width: 120, height: 40 }} active />
    </Card>
  );
}