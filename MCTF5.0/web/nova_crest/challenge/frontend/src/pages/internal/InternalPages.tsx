import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuth } from '../../auth/AuthProvider';
import { QMongoDocumentation } from '../../components/QMongoDocumentation';
import { QMongoEditor } from '../../components/QMongoEditor';
import { API_BASE_URL } from '../../lib/api';
import type {
  AdminDashboardSummary,
  PortalDashboardSummary,
  StaffDashboardSummary,
} from '../../types';

interface QMongoGlobalApi {
  parse: (source: string) => unknown;
}

let qmongoLoadPromise: Promise<QMongoGlobalApi> | null = null;

function asQMongoWindow(): Window & { Validator?: QMongoGlobalApi } {
  return window as Window & { Validator?: QMongoGlobalApi };
}

function resolveQMongoScriptUrls(): string[] {
  const apiRoot = API_BASE_URL.replace(/\/?api$/, '');
  if (!apiRoot) return ['/assets/index-Mn8QaZ5r.js'];
  return ['/assets/index-Mn8QaZ5r.js', `${apiRoot}/assets/index-Mn8QaZ5r.js`];
}

function injectQMongoScript(src: string): Promise<QMongoGlobalApi> {
  return new Promise((resolve, reject) => {
    const normalizedSrc = new URL(src, window.location.origin).toString();
    const existing = Array.from(document.getElementsByTagName('script')).find((entry) => {
      const currentSrc = entry.getAttribute('src') || entry.src;
      if (!currentSrc) return false;

      try {
        return new URL(currentSrc, window.location.origin).toString() === normalizedSrc;
      } catch {
        return false;
      }
    });

    if (existing) {
      const readyApi = asQMongoWindow().Validator;
      if (readyApi?.parse) {
        resolve(readyApi);
        return;
      }

      existing.addEventListener('load', () => {
        const loadedApi = asQMongoWindow().Validator;
        if (loadedApi?.parse) {
          resolve(loadedApi);
          return;
        }

        reject(new Error('QMongo runtime loaded but Validator.parse is unavailable'));
      });

      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)));
      return;
    }

    const script = document.createElement('script');
        script.async = true;
    script.defer = true;
  script.src = src;


    script.onload = () => {
      const loadedApi = asQMongoWindow().Validator;
      if (loadedApi?.parse) {
        resolve(loadedApi);
        return;
      }

      reject(new Error('QMongo runtime loaded but Validator.parse is unavailable'));
    };

    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function loadQMongoApi(): Promise<QMongoGlobalApi> {
  const existingApi = asQMongoWindow().Validator;
  if (existingApi?.parse) {
    return Promise.resolve(existingApi);
  }

  if (qmongoLoadPromise) return qmongoLoadPromise;

  qmongoLoadPromise = (async () => {
    const candidates = resolveQMongoScriptUrls();
    let lastError: Error | null = null;

    for (const src of candidates) {
      try {
        const api = await injectQMongoScript(src);
        return api;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown QMongo runtime load error');
      }
    }

    throw lastError || new Error('Unable to load QMongo runtime script');
  })();

  return qmongoLoadPromise;
}

type RowData = Record<string, unknown>;

interface ListResponse {
  items: RowData[];
  total: number;
}

interface ColumnDef {
  key: string;
  label: string;
}

interface FormFieldDef {
  name: string;
  label: string;
  kind?: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
}

function toLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function asDate(value: unknown): string {
  if (!value) return '-';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function prettyColumn(key: string): string {
  return toLabel(key.replace(/^_/, ''));
}

function pickColumns(items: RowData[]): ColumnDef[] {
  const candidates = [
    'title',
    'name',
    'fullName',
    'email',
    'code',
    'compound',
    'subject',
    'status',
    'stage',
    'department',
    'location',
    'createdAt',
    'updatedAt',
  ];

  const first = items[0] || {};
  const chosen = candidates.filter((key) => first[key] !== undefined).slice(0, 6);

  if (chosen.length === 0) {
    return Object.keys(first)
      .filter((key) => !key.startsWith('_'))
      .slice(0, 6)
      .map((key) => ({ key, label: prettyColumn(key) }));
  }

  return chosen.map((key) => ({ key, label: prettyColumn(key) }));
}

function StatusPill({ value }: { value: unknown }) {
  return <span className="status-pill">{asText(value)}</span>;
}

function DashboardCards({ values }: { values: Record<string, number> }) {
  return (
    <div className="dashboard-grid">
      {Object.entries(values).map(([key, value]) => (
        <article key={key} className="dashboard-card">
          <h3>{toLabel(key)}</h3>
          <p>{value}</p>
        </article>
      ))}
    </div>
  );
}

function DataTable({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: RowData[];
  columns?: ColumnDef[];
}) {
  const resolvedColumns = columns && columns.length > 0 ? columns : pickColumns(rows);

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel__header">
        <h2>{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="muted">No records found.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {resolvedColumns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={String(row._id || row.id || index)}>
                  {resolvedColumns.map((column) => {
                    const cell = row[column.key];
                    if (column.key === 'status') {
                      return (
                        <td key={column.key}>
                          <StatusPill value={cell} />
                        </td>
                      );
                    }

                    if (column.key.toLowerCase().includes('at')) {
                      return <td key={column.key}>{asDate(cell)}</td>;
                    }

                    return <td key={column.key}>{asText(cell)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DetailGrid({ title, record }: { title: string; record: RowData | null }) {
  if (!record) {
    return <div className="page-card">Loading...</div>;
  }

  const entries = Object.entries(record).filter(
    ([key]) => !['__v'].includes(key) && !key.startsWith('_'),
  );

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>{title}</h2>
      </div>
      <div className="kv-grid">
        {entries.map(([key, value]) => (
          <article key={key} className="kv-item">
            <h4>{prettyColumn(key)}</h4>
            {key === 'status' ? <StatusPill value={value} /> : <p>{asText(value)}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function parseIdValue(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    return String(record._id || record.id || '');
  }
  return String(value);
}

function readFormValue(field: FormFieldDef, raw: unknown): string | number | boolean {
  if (field.kind === 'checkbox') {
    return Boolean(raw);
  }

  if (field.kind === 'number') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (raw === undefined || raw === null) {
    return '';
  }

  if (typeof raw === 'object') {
    return parseIdValue(raw);
  }

  return String(raw);
}

function buildPayloadFromForm(
  fields: FormFieldDef[],
  values: Record<string, string | number | boolean>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  fields.forEach((field) => {
    const value = values[field.name];

    if (field.kind === 'checkbox') {
      payload[field.name] = Boolean(value);
      return;
    }

    if (field.kind === 'number') {
      if (value === '' || value === null || value === undefined) return;
      payload[field.name] = Number(value);
      return;
    }

    const asString = String(value ?? '').trim();
    if (!asString) return;

    if (field.name === 'requirements' || field.name === 'benefits' || field.name === 'tags') {
      payload[field.name] = asString
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      return;
    }

    payload[field.name] = asString;
  });

  return payload;
}

function resourceColumns(resource: string): ColumnDef[] {
  const map: Record<string, ColumnDef[]> = {
    users: [
      { key: 'fullName', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'userType', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created' },
    ],
    roles: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'createdAt', label: 'Created' },
    ],
    sessions: [
      { key: 'userAgent', label: 'User Agent' },
      { key: 'ipAddress', label: 'IP' },
      { key: 'expiresAt', label: 'Expires' },
      { key: 'revokedAt', label: 'Revoked' },
    ],
    'audit-logs': [
      { key: 'action', label: 'Action' },
      { key: 'entityType', label: 'Entity' },
      { key: 'method', label: 'Method' },
      { key: 'route', label: 'Route' },
      { key: 'createdAt', label: 'Created' },
    ],
    articles: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'publishedAt', label: 'Published' },
    ],
    'pipeline-programs': [
      { key: 'compound', label: 'Compound' },
      { key: 'condition', label: 'Condition' },
      { key: 'stage', label: 'Stage' },
      { key: 'status', label: 'Status' },
    ],
    'team-profiles': [
      { key: 'name', label: 'Name' },
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status' },
      { key: 'updatedAt', label: 'Updated' },
    ],
    'job-postings': [
      { key: 'title', label: 'Title' },
      { key: 'department', label: 'Department' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
    ],
    'job-applications': [
      { key: 'status', label: 'Status' },
      { key: 'resumeUrl', label: 'Resume' },
      { key: 'createdAt', label: 'Created' },
    ],
    inquiries: [
      { key: 'subject', label: 'Subject' },
      { key: 'email', label: 'Email' },
      { key: 'source', label: 'Source' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created' },
    ],
  };

  return map[resource] || [];
}

function resourceFormFields(resource: string): FormFieldDef[] {
  const map: Record<string, FormFieldDef[]> = {
    users: [
      { name: 'email', label: 'Email', kind: 'email', required: true },
      { name: 'fullName', label: 'Full Name', required: true },
      { name: 'title', label: 'Title' },
      { name: 'phoneNumber', label: 'Phone Number' },
      { name: 'avatarUrl', label: 'Avatar URL' },
      { name: 'roleCode', label: 'Role', kind: 'select', options: ['staff', 'admin'] },
      { name: 'userType', label: 'User Type', kind: 'select', options: ['internal', 'external'] },
      { name: 'status', label: 'Status', kind: 'select', options: ['active', 'disabled', 'pending_verification'] },
    ],
    roles: [
      { name: 'code', label: 'Code', required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', kind: 'textarea' },
    ],
    articles: [
      { name: 'title', label: 'Title', required: true },
      { name: 'slug', label: 'Slug' },
      { name: 'category', label: 'Category', kind: 'select', options: ['news', 'knowledge'], required: true },
      { name: 'visibility', label: 'Visibility', kind: 'select', options: ['public', 'internal'] },
      { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'published', 'archived'] },
      { name: 'excerpt', label: 'Excerpt', kind: 'textarea' },
      { name: 'body', label: 'Body', kind: 'textarea', required: true },
      { name: 'tags', label: 'Tags (comma separated)' },
      { name: 'coverImageUrl', label: 'Cover Image URL' },
    ],
    'pipeline-programs': [
      { name: 'compound', label: 'Compound', required: true },
      { name: 'condition', label: 'Condition', required: true },
      { name: 'modality', label: 'Modality', required: true },
      {
        name: 'stage',
        label: 'Stage',
        kind: 'select',
        options: ['Preclinical', 'Phase I', 'Phase II', 'Phase III', 'FDA Review'],
        required: true,
      },
      { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'published', 'archived'] },
      { name: 'highlight', label: 'Highlight', kind: 'checkbox' },
      { name: 'summary', label: 'Summary', kind: 'textarea' },
      { name: 'description', label: 'Description', kind: 'textarea' },
      { name: 'slug', label: 'Slug' },
    ],
    'team-profiles': [
      { name: 'name', label: 'Name', required: true },
      { name: 'title', label: 'Title', required: true },
      { name: 'bio', label: 'Bio', kind: 'textarea', required: true },
      { name: 'initials', label: 'Initials', required: true },
      { name: 'displayOrder', label: 'Display Order', kind: 'number' },
      { name: 'imageUrl', label: 'Image URL' },
      { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'published', 'archived'] },
      { name: 'linkedUserId', label: 'Linked User ID' },
      { name: 'slug', label: 'Slug' },
    ],
    'job-postings': [
      { name: 'title', label: 'Title', required: true },
      { name: 'department', label: 'Department', required: true },
      { name: 'location', label: 'Location', required: true },
      { name: 'summary', label: 'Summary', kind: 'textarea' },
      { name: 'description', label: 'Description', kind: 'textarea', required: true },
      { name: 'requirements', label: 'Requirements (comma separated)' },
      { name: 'benefits', label: 'Benefits (comma separated)' },
      { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'published', 'closed', 'archived'] },
      { name: 'slug', label: 'Slug' },
    ],
    'job-applications': [
      { name: 'userId', label: 'User ID', required: true },
      { name: 'jobPostingId', label: 'Job Posting ID', required: true },
      { name: 'resumeUrl', label: 'Resume URL' },
      { name: 'coverLetter', label: 'Cover Letter', kind: 'textarea' },
      { name: 'status', label: 'Status', kind: 'select', options: ['submitted', 'under_review', 'accepted', 'rejected'] },
      { name: 'adminNotes', label: 'Admin Notes', kind: 'textarea' },
    ],
    inquiries: [
      { name: 'source', label: 'Source', kind: 'select', options: ['public', 'portal'] },
      { name: 'userId', label: 'User ID' },
      { name: 'fullName', label: 'Full Name', required: true },
      { name: 'email', label: 'Email', kind: 'email', required: true },
      { name: 'company', label: 'Company' },
      { name: 'subject', label: 'Subject', required: true },
      { name: 'message', label: 'Message', kind: 'textarea', required: true },
      { name: 'status', label: 'Status', kind: 'select', options: ['open', 'in_progress', 'resolved', 'closed'] },
      { name: 'adminNotes', label: 'Admin Notes', kind: 'textarea' },
    ],
  };

  return map[resource] || [];
}

function resourceItemKey(resource: string): string {
  if (resource === 'users') return 'user';
  if (resource === 'roles') return 'role';
  if (resource === 'sessions') return 'session';
  if (resource === 'audit-logs') return 'auditLog';
  if (resource === 'job-applications') return 'application';
  if (resource === 'inquiries') return 'inquiry';
  return 'item';
}

function adminResourceLabel(resource: string): string {
  return resource.replace('-', ' ').replace(/\b\w/g, (value) => value.toUpperCase());
}

export function PortalDashboardPage() {
  const { authFetch } = useAuth();
  const [summary, setSummary] = useState<PortalDashboardSummary | null>(null);

  useEffect(() => {
    authFetch<{ summary: PortalDashboardSummary }>('/portal/dashboard-summary').then((data) => {
      setSummary(data.summary);
    });
  }, [authFetch]);

  if (!summary) return <div className="page-card">Loading portal dashboard...</div>;

  return (
    <>
      <DashboardCards values={summary.applicationCounts} />
      <DashboardCards values={summary.inquiryCounts} />
      <DataTable title="Recent Applications" rows={summary.recentApplications} />
      <DataTable title="Recent Inquiries" rows={summary.recentInquiries} />
    </>
  );
}

export function StaffDashboardPage() {
  const { authFetch } = useAuth();
  const [summary, setSummary] = useState<StaffDashboardSummary | null>(null);

  useEffect(() => {
    authFetch<{ summary: StaffDashboardSummary }>('/staff/dashboard-summary').then((data) => {
      setSummary(data.summary);
    });
  }, [authFetch]);

  if (!summary) return <div className="page-card">Loading staff dashboard...</div>;

  return (
    <>
      <section className="panel">
        <div className="panel__header">
          <h2>Content Totals</h2>
        </div>
        <div className="subgrid">
          {Object.entries(summary.counts).map(([resourceName, counts]) => (
            <article key={resourceName} className="mini-card">
              <h3>{toLabel(resourceName)}</h3>
              <div className="mini-card__items">
                {Object.entries(counts).map(([key, value]) => (
                  <p key={key}>
                    <span>{toLabel(key)}</span>
                    <strong>{value}</strong>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <DataTable title="Recent Articles" rows={summary.recent.articles} />
      <DataTable title="Recent Pipeline Programs" rows={summary.recent.pipelinePrograms} />
      <DataTable title="Recent Team Profiles" rows={summary.recent.teamProfiles} />
      <DataTable title="Recent Job Postings" rows={summary.recent.jobPostings} />
    </>
  );
}

export function AdminDashboardPage() {
  const { authFetch } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);

  useEffect(() => {
    authFetch<{ summary: AdminDashboardSummary }>('/admin/dashboard-summary').then((data) => {
      setSummary(data.summary);
    });
  }, [authFetch]);

  if (!summary) return <div className="page-card">Loading admin dashboard...</div>;

  return (
    <>
      <DashboardCards values={summary.sessions} />
      <DashboardCards values={summary.users} />
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel__header">
          <h2>Content Workflow</h2>
        </div>
        <div className="subgrid">
          {Object.entries(summary.content).map(([name, counts]) => (
            <article className="mini-card" key={name}>
              <h3>{toLabel(name)}</h3>
              <div className="mini-card__items">
                {Object.entries(counts).map(([key, value]) => (
                  <p key={key}>
                    <span>{toLabel(key)}</span>
                    <strong>{value}</strong>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel__header">
          <h2>Operational Workflow</h2>
        </div>
        <div className="subgrid">
          {Object.entries(summary.workflows).map(([name, counts]) => (
            <article className="mini-card" key={name}>
              <h3>{toLabel(name)}</h3>
              <div className="mini-card__items">
                {Object.entries(counts).map(([key, value]) => (
                  <p key={key}>
                    <span>{toLabel(key)}</span>
                    <strong>{value}</strong>
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <DataTable title="Recent Applications" rows={summary.recentApplications} />
      <DataTable title="Recent Inquiries" rows={summary.recentInquiries} />
      <DataTable title="Recent Audit Logs" rows={summary.recentAuditLogs} columns={resourceColumns('audit-logs')} />
    </>
  );
}

export function PortalProfilePage() {
  const { authFetch, setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [title, setTitle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    authFetch<{ user: { fullName: string; phoneNumber: string; title: string; avatarUrl: string } }>(
      '/portal/profile',
    ).then(({ user }) => {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
      setTitle(user.title || '');
      setAvatarUrl(user.avatarUrl || '');
    });
  }, [authFetch]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const data = await authFetch<{ user: RowData }>('/portal/profile', {
      method: 'PATCH',
      body: JSON.stringify({ fullName, phoneNumber, title, avatarUrl }),
    });

    setUser(data.user as never);
    setMessage('Profile saved.');
  };

  return (
    <form className="page-card form-grid" onSubmit={onSubmit}>
      <h2>My Profile</h2>
      <label className="field">
        <span>Full Name</span>
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>
      <label className="field">
        <span>Phone Number</span>
        <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
      </label>
      <label className="field">
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="field">
        <span>Avatar URL</span>
        <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
      </label>
      {message ? <p className="form-success">{message}</p> : null}
      <button className="button button--filled" type="submit">
        Save Profile
      </button>
    </form>
  );
}

export function PortalApplicationCreatePage() {
  return <PortalCreateForm mode="application" />;
}

export function PortalInquiryCreatePage() {
  return <PortalCreateForm mode="inquiry" />;
}

function PortalCreateForm({ mode }: { mode: 'application' | 'inquiry' }) {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>(
    mode === 'application'
      ? { jobPostingId: '', resumeUrl: '', coverLetter: '' }
      : { fullName: '', email: '', company: '', subject: '', message: '' },
  );
  const [error, setError] = useState('');

  const endpoint = mode === 'application' ? '/portal/job-applications' : '/portal/inquiries';

  return (
    <form
      className="page-card form-grid"
      onSubmit={async (event) => {
        event.preventDefault();
        setError('');

        try {
          await authFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(form),
          });
          navigate(mode === 'application' ? '/portal/applications' : '/portal/inquiries');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to submit form.');
        }
      }}
    >
      <h2>{mode === 'application' ? 'New Job Application' : 'New Inquiry'}</h2>

      {mode === 'application' ? (
        <>
          <label className="field">
            <span>Job Posting ID</span>
            <input
              value={form.jobPostingId || ''}
              onChange={(event) => setForm((current) => ({ ...current, jobPostingId: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Resume URL</span>
            <input
              value={form.resumeUrl || ''}
              onChange={(event) => setForm((current) => ({ ...current, resumeUrl: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Cover Letter</span>
            <textarea
              rows={6}
              value={form.coverLetter || ''}
              onChange={(event) => setForm((current) => ({ ...current, coverLetter: event.target.value }))}
            />
          </label>
        </>
      ) : (
        <>
          <label className="field">
            <span>Full Name</span>
            <input
              value={form.fullName || ''}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email || ''}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Company</span>
            <input
              value={form.company || ''}
              onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Subject</span>
            <input
              value={form.subject || ''}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea
              rows={6}
              value={form.message || ''}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              required
            />
          </label>
        </>
      )}

      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button--filled" type="submit">
        Submit
      </button>
    </form>
  );
}

function getPortalConfig(mode: 'applications' | 'inquiries') {
  if (mode === 'applications') {
    return {
      list: '/portal/job-applications',
      detailPrefix: '/portal/job-applications/',
      newPath: '/portal/applications/new',
    };
  }

  return {
    list: '/portal/inquiries',
    detailPrefix: '/portal/inquiries/',
    newPath: '/portal/inquiries/new',
  };
}

export function PortalListPage({ mode }: { mode: 'applications' | 'inquiries' }) {
  const { authFetch } = useAuth();
  const config = getPortalConfig(mode);
  const [result, setResult] = useState<ListResponse | null>(null);

  useEffect(() => {
    authFetch<ListResponse>(config.list).then(setResult);
  }, [authFetch, config.list]);

  if (!result) return <div className="page-card">Loading...</div>;

  return (
    <section className="panel">
      <div className="panel__header panel__header--spaced">
        <h2>{mode === 'applications' ? 'My Applications' : 'My Inquiries'}</h2>
        <Link className="button button--filled" to={config.newPath}>
          New {mode === 'applications' ? 'Application' : 'Inquiry'}
        </Link>
      </div>
      <DataTable title="" rows={result.items} />
      <div className="entity-list" style={{ marginTop: 12 }}>
        {result.items.map((item) => (
          <Link
            key={String(item._id || item.id)}
            className="entity-item"
            to={`${mode === 'applications' ? '/portal/applications' : '/portal/inquiries'}/${String(item._id || item.id)}`}
          >
            <strong>{asText(item.subject || item.status || item._id)}</strong>
            <p className="muted">Created {asDate(item.createdAt)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PortalDetailPage({ mode }: { mode: 'applications' | 'inquiries' }) {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const config = getPortalConfig(mode);
  const [record, setRecord] = useState<RowData | null>(null);

  useEffect(() => {
    authFetch<Record<string, RowData>>(`${config.detailPrefix}${id}`).then((data) => {
      setRecord((data.application || data.inquiry) as RowData);
    });
  }, [authFetch, config.detailPrefix, id]);

  return <DetailGrid title={mode === 'applications' ? 'Application Details' : 'Inquiry Details'} record={record} />;
}

export function StaffContentListPage({ resource }: { resource: string }) {
  const { authFetch } = useAuth();
  const [result, setResult] = useState<ListResponse | null>(null);

  useEffect(() => {
    authFetch<ListResponse>(`/staff/${resource}`).then(setResult);
  }, [authFetch, resource]);

  if (!result) return <div className="page-card">Loading...</div>;

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>{adminResourceLabel(resource)}</h2>
      </div>
      <DataTable title="" rows={result.items} columns={resourceColumns(resource)} />
      <div className="entity-list" style={{ marginTop: 12 }}>
        {result.items.map((item) => (
          <Link
            key={String(item._id || item.id)}
            className="entity-item"
            to={`/staff/${resource}/${String(item._id || item.id)}`}
          >
            <strong>{asText(item.title || item.compound || item.name || item._id)}</strong>
            <p className="muted">{asText(item.status)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function StaffContentDetailPage({ resource }: { resource: string }) {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const [record, setRecord] = useState<RowData | null>(null);

  useEffect(() => {
    authFetch<{ item: RowData }>(`/staff/${resource}/${id}`).then((data) => {
      setRecord(data.item);
    });
  }, [authFetch, resource, id]);

  return <DetailGrid title={`${adminResourceLabel(resource)} Details`} record={record} />;
}

export function AdminEntityListPage({
  resource,
  createPath,
}: {
  resource: string;
  createPath?: string;
}) {
  const { authFetch } = useAuth();
  const [result, setResult] = useState<ListResponse | null>(null);

  useEffect(() => {
    authFetch<ListResponse>(`/admin/${resource}`).then(setResult);
  }, [authFetch, resource]);

  if (!result) return <div className="page-card">Loading...</div>;

  return (
    <section className="panel">
      <div className="panel__header panel__header--spaced">
        <h2>{adminResourceLabel(resource)}</h2>
        {createPath ? (
          <Link className="button button--filled" to={createPath}>
            New {adminResourceLabel(resource)}
          </Link>
        ) : null}
      </div>
      <DataTable title="" rows={result.items} columns={resourceColumns(resource)} />
      <div className="entity-list" style={{ marginTop: 12 }}>
        {result.items.map((item) => (
          <Link
            key={String(item._id || item.id)}
            className="entity-item"
            to={`/admin/${resource}/${String(item._id || item.id)}`}
          >
            <strong>
              {asText(
                item.title
                || item.name
                || item.code
                || item.email
                || item.compound
                || item.subject
                || item.action
                || item._id,
              )}
            </strong>
            <p className="muted">
              {asText(item.status)} {item.createdAt ? `- ${asDate(item.createdAt)}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AdminEntityDetailPage({ resource }: { resource: string }) {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const [record, setRecord] = useState<RowData | null>(null);
  const key = useMemo(() => resourceItemKey(resource), [resource]);

  useEffect(() => {
    authFetch<Record<string, RowData>>(`/admin/${resource}/${id}`).then((data) => {
      setRecord(data[key]);
    });
  }, [authFetch, id, key, resource]);

  return (
    <>
      <div className="entity-toolbar">
        {resource !== 'audit-logs' ? (
          <Link className="button button--outline" to={`/admin/${resource}/${id}/edit`}>
            Edit
          </Link>
        ) : null}
      </div>
      <DetailGrid title={`${adminResourceLabel(resource)} Details`} record={record} />
    </>
  );
}

function normalizeResourceForCreate(resource: string): string {
  if (resource === 'users') return '/admin/users/staff';
  return `/admin/${resource}`;
}

function initializeFormValues(fields: FormFieldDef[], template?: RowData): Record<string, string | number | boolean> {
  const initial: Record<string, string | number | boolean> = {};

  fields.forEach((field) => {
    const templateValue = template ? template[field.name] : undefined;

    if (field.kind === 'checkbox') {
      initial[field.name] = Boolean(templateValue);
      return;
    }

    if (field.kind === 'number') {
      const parsed = Number(templateValue);
      initial[field.name] = Number.isFinite(parsed) ? parsed : 0;
      return;
    }

    initial[field.name] = templateValue === undefined || templateValue === null ? '' : String(templateValue);
  });

  return initial;
}

export function AdminEntityFormPage({
  resource,
  mode,
  template,
}: {
  resource: string;
  mode: 'create' | 'edit';
  template?: RowData;
}) {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const fields = useMemo(() => resourceFormFields(resource), [resource]);
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() =>
    initializeFormValues(fields, template),
  );
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'edit') return;

    const key = resourceItemKey(resource);

    authFetch<Record<string, RowData>>(`/admin/${resource}/${id}`).then((data) => {
      const record = data[key];
      const nextValues = initializeFormValues(fields);

      fields.forEach((field) => {
        nextValues[field.name] = readFormValue(field, record?.[field.name]);
      });

      setValues(nextValues);
      setLoading(false);
    });
  }, [authFetch, fields, id, mode, resource]);

  if (loading) return <div className="page-card">Loading form...</div>;

  return (
    <form
      className="page-card form-grid"
      onSubmit={async (event) => {
        event.preventDefault();
        setError('');

        try {
          const payload = buildPayloadFromForm(fields, values);
          await authFetch(mode === 'create' ? normalizeResourceForCreate(resource) : `/admin/${resource}/${id}`, {
            method: mode === 'create' ? 'POST' : 'PATCH',
            body: JSON.stringify(payload),
          });

          navigate(`/admin/${resource}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save form.');
        }
      }}
    >
      <h2>
        {mode === 'create' ? 'Create' : 'Edit'} {adminResourceLabel(resource)}
      </h2>

      {fields.map((field) => {
        const value = values[field.name];

        if (field.kind === 'textarea') {
          return (
            <label key={field.name} className="field">
              <span>{field.label}</span>
              <textarea
                rows={6}
                value={String(value ?? '')}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                required={field.required}
              />
            </label>
          );
        }

        if (field.kind === 'select') {
          return (
            <label key={field.name} className="field">
              <span>{field.label}</span>
              <select
                value={String(value ?? '')}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                required={field.required}
              >
                <option value="">Select...</option>
                {(field.options || []).map((option) => (
                  <option key={option} value={option}>
                    {toLabel(option)}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (field.kind === 'checkbox') {
          return (
            <label key={field.name} className="field field--checkbox">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
              />
              <span>{field.label}</span>
            </label>
          );
        }

        return (
          <label key={field.name} className="field">
            <span>{field.label}</span>
            <input
              type={field.kind === 'number' ? 'number' : field.kind === 'email' ? 'email' : 'text'}
              value={String(value ?? '')}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: field.kind === 'number' ? Number(event.target.value || 0) : event.target.value,
                }))
              }
              required={field.required}
            />
          </label>
        );
      })}

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button button--filled" type="submit">
        {mode === 'create' ? 'Create' : 'Save'}
      </button>
    </form>
  );
}

export function AdminEntityDeleteButton({ resource }: { resource: string }) {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  if (resource === 'audit-logs') return null;

  return (
    <button
      className="button button--outline"
      type="button"
      onClick={async () => {
        await authFetch(`/admin/${resource}/${id}`, { method: 'DELETE' });
        navigate(`/admin/${resource}`);
      }}
    >
      Archive/Delete
    </button>
  );
}

function isObject(value: unknown): value is RowData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface QMongoNodeData {
  title: string;
  subtitle?: string;
  properties?: Record<string, string>;
  fullProperties?: Record<string, string>;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  accentColor?: string;
}

function QMongoGraphNode({ data }: NodeProps<QMongoNodeData>) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(data.properties || {});
  const fullEntries = Object.entries(data.fullProperties || {});

  return (
    <div
      className="qmongo-node"
      style={{
        background: data.bgColor,
        borderColor: data.borderColor,
        color: data.textColor,
        ['--qmongo-accent' as string]: data.accentColor || '#8bd4af',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="qmongo-node__header qmongo-node__drag">
        <div className="qmongo-node__title">{data.title}</div>
        <button
          type="button"
          className="qmongo-node__expand nodrag"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        >
          Expand
        </button>
      </div>
      {data.subtitle ? <div className="qmongo-node__subtitle">{data.subtitle}</div> : null}
      <div className="qmongo-node__meta">
        {entries.length} properties - drag node to move
      </div>
      {entries.length > 0 ? (
        <div className="qmongo-node__preview">
          {entries.slice(0, 3).map(([key, value]) => (
            <p key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </p>
          ))}
        </div>
      ) : null}
      {expanded && fullEntries.length > 0 ? (
        <div className="qmongo-node__popup nodrag" onClick={(event) => event.stopPropagation()}>
          <div className="qmongo-node__popup-title">Full Properties</div>
          <div className="qmongo-node__props">
            {fullEntries.map(([key, value]) => (
              <p key={key}>
                <span>{key}</span>
                <strong>{value}</strong>
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const qmongoNodeTypes: NodeTypes = {
  entity: QMongoGraphNode,
};

function colorForModel(model: string): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
} {
  const key = model.toLowerCase();

  if (key.includes('user')) {
    return {
      bgColor: '#111f33',
      borderColor: '#3e6ec9',
      textColor: '#e7f0ff',
      accentColor: '#8eb3ff',
    };
  }

  if (key.includes('role') || key.includes('session')) {
    return {
      bgColor: '#1f1630',
      borderColor: '#7d56be',
      textColor: '#f2e9ff',
      accentColor: '#c39dff',
    };
  }

  if (key.includes('article') || key.includes('pipeline') || key.includes('team') || key.includes('job')) {
    return {
      bgColor: '#16261d',
      borderColor: '#3d8f67',
      textColor: '#e8fff1',
      accentColor: '#91e0b8',
    };
  }

  if (key.includes('inquiry') || key.includes('audit')) {
    return {
      bgColor: '#2b2014',
      borderColor: '#ad7a41',
      textColor: '#fff5e8',
      accentColor: '#e5b47b',
    };
  }

  return {
    bgColor: '#0f1f18',
    borderColor: '#2f5c49',
    textColor: '#e6fff2',
    accentColor: '#8bd4af',
  };
}

function isObjectIdLike(value: unknown): boolean {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

function shortId(value: string): string {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function truncateWithEllipsis(value: string, maxLength = 42): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function modelFromRecord(record: RowData): string {
  const candidate =
    (record.__model as string | undefined)
    || (record.model as string | undefined)
    || (record.entityType as string | undefined)
    || (record.__typename as string | undefined);

  return candidate ? String(candidate) : 'Record';
}

function buildQMongoGraph(data: unknown): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeByKey = new Map<string, string>();
  const depthNextY: Record<number, number> = {};

  const nextPosition = (depth: number, height: number) => {
    const currentY = depthNextY[depth] || 0;
    depthNextY[depth] = currentY + height + 32;
    return { x: depth * 350, y: currentY };
  };

  const ensureNode = (
    key: string,
    label: string,
    depth: number,
    subtitle?: string,
    properties?: Record<string, string>,
    fullProperties?: Record<string, string>,
  ) => {
    const existing = nodeByKey.get(key);
    if (existing) return existing;

    const id = `node-${nodeByKey.size + 1}`;
    nodeByKey.set(key, id);
    const propertyCount = Object.keys(properties || {}).length;
    const dynamicHeight = 92 + Math.min(propertyCount, 20) * 7;
    const colors = colorForModel(label);
    nodes.push({
      id,
      position: nextPosition(depth, dynamicHeight),
      type: 'entity',
      data: {
        title: label,
        subtitle,
        properties,
        fullProperties: fullProperties || properties,
        ...colors,
      } satisfies QMongoNodeData,
      draggable: true,
      style: {
        border: `1px solid ${colors.borderColor}`,
        borderRadius: 8,
        background: colors.bgColor,
        color: colors.textColor,
        width: 240,
        minHeight: dynamicHeight,
        fontSize: 12,
        lineHeight: 1.4,
        whiteSpace: 'normal',
      },
    });
    return id;
  };

  const connect = (from: string, to: string, label?: string) => {
    const id = `${from}-${to}-${label || ''}`;
    if (edges.some((edge) => edge.id === id)) return;

    edges.push({
      id,
      source: from,
      target: to,
      label,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#4fb386' },
      labelStyle: { fill: '#b8f5d8', fontSize: 11 },
    });
  };

  const walk = (value: unknown, parentNodeId: string, depth: number, edgeLabel: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, parentNodeId, depth, `${edgeLabel}[${index}]`);
      });
      return;
    }

    if (isObject(value)) {
      const objectId = typeof value._id === 'string' ? value._id : undefined;
      const key = objectId ? `${modelFromRecord(value)}:${objectId}` : `${parentNodeId}:${edgeLabel}:${depth}`;

      const summaryParts = Object.entries(value)
        .filter(([field, fieldValue]) => !field.startsWith('_') && !Array.isArray(fieldValue) && !isObject(fieldValue))
        .slice(0, 3)
        .map(([field, fieldValue]) => `${field}: ${truncateWithEllipsis(asText(fieldValue), 28)}`);

      const fullPropertyMap = Object.fromEntries(
        Object.entries(value)
          .filter(([field, fieldValue]) => !field.startsWith('_') && !Array.isArray(fieldValue) && !isObject(fieldValue))
          .map(([field, fieldValue]) => [field, asText(fieldValue)]),
      );

      const propertyMap = Object.fromEntries(
        Object.entries(value)
          .filter(([field, fieldValue]) => !field.startsWith('_') && !Array.isArray(fieldValue) && !isObject(fieldValue))
          .map(([field, fieldValue]) => [field, truncateWithEllipsis(asText(fieldValue))]),
      );

      const objectNodeId = ensureNode(
        key,
        modelFromRecord(value),
        depth,
        [objectId ? `id: ${shortId(objectId)}` : '', ...summaryParts].filter(Boolean).join('\n'),
        propertyMap,
        fullPropertyMap,
      );

      connect(parentNodeId, objectNodeId, edgeLabel);

      Object.entries(value).forEach(([field, fieldValue]) => {
        if (field.startsWith('_')) return;

        const relationLike = /(?:Id|Ids|Ref|Refs)$/.test(field);

        if (Array.isArray(fieldValue) || isObject(fieldValue)) {
          walk(fieldValue, objectNodeId, depth + 1, field);
          return;
        }

        if (relationLike && isObjectIdLike(fieldValue)) {
          const refNodeId = ensureNode(`ref:${field}:${String(fieldValue)}`, toLabel(field), depth + 1, `id: ${shortId(String(fieldValue))}`);
          connect(objectNodeId, refNodeId, field);
          return;
        }

        if (relationLike && Array.isArray(fieldValue)) {
          (fieldValue as unknown[]).forEach((entry, index) => {
            if (!isObjectIdLike(entry)) return;
            const refNodeId = ensureNode(
              `ref:${field}:${String(entry)}`,
              `${toLabel(field)} ${index + 1}`,
              depth + 1,
              `id: ${shortId(String(entry))}`,
            );
            connect(objectNodeId, refNodeId, `${field}[${index}]`);
          });
        }
      });

      return;
    }

    const leafNodeId = ensureNode(
      `${parentNodeId}:${edgeLabel}:${String(value)}`,
      toLabel(edgeLabel),
      depth,
      asText(value),
      { value: asText(value) },
    );
    connect(parentNodeId, leafNodeId, edgeLabel);
  };

  const rootId = ensureNode(
    'query-root',
    'QMongo Query Result',
    0,
    Array.isArray(data) ? `rows: ${data.length}` : 'single result',
    {
      resultType: Array.isArray(data) ? 'Array' : typeof data,
      rowCount: Array.isArray(data) ? String(data.length) : '1',
    },
  );

  if (Array.isArray(data)) {
    data.forEach((item, index) => walk(item, rootId, 1, `row ${index + 1}`));
  } else {
    walk(data, rootId, 1, 'result');
  }

  return { nodes, edges };
}

function QMongoResultView({ result }: { result: { data: unknown; queryPlan: unknown[] } | null }) {
  if (!result) return null;

  const graph = useMemo(() => buildQMongoGraph(result.data), [result.data]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setNodes, setEdges]);

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel__header">
        <h2>Graph Visualization</h2>
        <p className="muted">Nodes represent records and connected relations inferred from IDs, refs, and nested model objects.</p>
      </div>
      <div className="qmongo-graph">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={qmongoNodeTypes}
          fitView
          nodesDraggable
          elementsSelectable
          panOnDrag
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background gap={16} size={1} color="#24503e" />
        </ReactFlow>
      </div>
    </section>
  );
}

interface ErrorLogRow extends RowData {
  source: 'express' | 'process';
  category: string;
  message: string;
  stack?: string;
  method?: string;
  route?: string;
  createdAt: string;
}

interface ErrorLogListResponse {
  items: ErrorLogRow[];
  total: number;
  page: number;
  limit: number;
}

export function AdminErrorLogsPage() {
  const { authFetch } = useAuth();
  const [logsPassword, setLogsPassword] = useState('');
  const [source, setSource] = useState<'all' | 'express' | 'process'>('all');
  const [items, setItems] = useState<ErrorLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <section className="page-card form-grid">
      <h2>Process Error Logs</h2>
      <p className="muted">
        Enter your logs password to fetch server error logs. This includes Express internal errors and process runtime failures.
      </p>

      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          setLoading(true);

          try {
            const response = await authFetch<ErrorLogListResponse>('/admin/error-logs/fetch', {
              method: 'POST',
              body: JSON.stringify({
                logsPassword,
                source: source === 'all' ? undefined : source,
                page: 1,
                limit: 50,
              }),
            });

            setItems(response.items);
            setTotal(response.total);
            setLogsPassword('');
          } catch (requestError) {
            setItems([]);
            setTotal(0);
            setError(requestError instanceof Error ? requestError.message : 'Failed to fetch error logs');
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="field">
          <span>Logs Password</span>
          <input
            type="password"
            value={logsPassword}
            onChange={(event) => setLogsPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="field">
          <span>Source</span>
          <select value={source} onChange={(event) => setSource(event.target.value as 'all' | 'express' | 'process')}>
            <option value="all">All</option>
            <option value="express">Express</option>
            <option value="process">Process</option>
          </select>
        </div>

        <button className="button button--filled" type="submit" disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Logs'}
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}

      <DataTable
        title={`Error Logs (${total})`}
        rows={items}
        columns={[
          { key: 'source', label: 'Source' },
          { key: 'category', label: 'Category' },
          { key: 'message', label: 'Message' },
          { key: 'stack', label: 'Stack' },
          { key: 'method', label: 'Method' },
          { key: 'route', label: 'Route' },
          { key: 'createdAt', label: 'Created' },
        ]}
      />
    </section>
  );
}

export function AdminQMongoPage() {
  const { authFetch } = useAuth();
  const [tab, setTab] = useState<'console' | 'documentation'>('console');
  const [query, setQuery] = useState('from User limit 5');
  const [result, setResult] = useState<{ data: unknown; queryPlan: unknown[] } | null>(null);
  const [error, setError] = useState('');
  const [qmongoRuntimeReady, setQmongoRuntimeReady] = useState(false);
  const [qmongoRuntimeError, setQmongoRuntimeError] = useState('');

  useEffect(() => {
    if (tab !== 'console') return;
    if (qmongoRuntimeReady) return;

    let cancelled = false;
    setQmongoRuntimeError('');

    loadQMongoApi()
      .then(() => {
        if (cancelled) return;
        setQmongoRuntimeReady(true);
      })
      .catch((runtimeError) => {
        if (cancelled) return;
        setQmongoRuntimeReady(false);
        setQmongoRuntimeError(runtimeError instanceof Error ? runtimeError.message : 'Failed to load QMongo runtime');
      });

    return () => {
      cancelled = true;
    };
  }, [tab, qmongoRuntimeReady]);

  return (
    <section className="page-card form-grid">
      <div className="qmongo-tabs" role="tablist" aria-label="QMongo tabs">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'console'}
          className={`qmongo-tab ${tab === 'console' ? 'qmongo-tab--active' : ''}`}
          onClick={() => setTab('console')}
        >
          Console
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'documentation'}
          className={`qmongo-tab ${tab === 'documentation' ? 'qmongo-tab--active' : ''}`}
          onClick={() => setTab('documentation')}
        >
          Documentation
        </button>
      </div>

      {tab === 'console' ? (
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');

            try {
              const qmongoApi = await loadQMongoApi();
              qmongoApi.parse(query);

              const response = await authFetch<{ data: unknown; queryPlan: unknown[] }>('/admin/qmongo/run', {
                method: 'POST',
                body: JSON.stringify({ query }),
              });
              setResult(response);
            } catch (err) {
              setResult(null);
              setError(err instanceof Error ? err.message : 'QMongo query failed');
            }
          }}
        >
          <h2>QMongo Console</h2>
          {!qmongoRuntimeReady && !qmongoRuntimeError ? (
            <p className="muted">Loading QMongo runtime for local syntax validation...</p>
          ) : null}
          {qmongoRuntimeError ? <p className="form-error">{qmongoRuntimeError}</p> : null}
          <div className="field">
            <span>Query</span>
            <QMongoEditor value={query} onChange={setQuery} height={360} />
          </div>
          <button className="button button--filled" type="submit">
            Run Query
          </button>
          {error ? <p className="form-error">{error}</p> : null}
          <QMongoResultView result={result} />
        </form>
      ) : (
        <QMongoDocumentation />
      )}
    </section>
  );
}
