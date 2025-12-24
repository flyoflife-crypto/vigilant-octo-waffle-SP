import type { OnePagerData, GanttData } from '@/types/onepager'

const createEmptyGantt = (): GanttData => ({
  labels: Array(13).fill('').map((_, i) => `P${i + 1}`),
  rows: [],
  bars: [],
  milestones: [],
  nowCol: 0,
  nowFrac: 0.5,
})

const createEmptyQuarterGantt = (): GanttData => ({
  labels: Array(13).fill('').map((_, i) => `W${i + 1}`),
  rows: [],
  bars: [],
  milestones: [],
  nowCol: 0,
  nowFrac: 0.5,
})

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'general' | 'software' | 'marketing' | 'product' | 'construction'
  data: OnePagerData
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start with an empty project',
    category: 'general',
    data: {
      projectName: 'New Project',
      niicDate: new Date().toISOString().split('T')[0],
      kpis: [],
      roles: {
        sponsor: null,
        productOwner: null,
        projectManager: null,
      },
      projectStatus: 'green',
      goal: '',
      description: '',
      yearGantt: createEmptyGantt(),
      quarterGantt: createEmptyQuarterGantt(),
      selectedQuarter: 0,
      done: [],
      next: [],
      teamMetrics: [],
      risks: [],
      artifacts: [],
      comments: '',
      extraSections: [],
    },
  },
  {
    id: 'software-development',
    name: 'Software Development',
    description: 'Template for software development projects',
    category: 'software',
    data: {
      projectName: 'Software Development Project',
      niicDate: new Date().toISOString().split('T')[0],
      kpis: [
        { label: 'Sprint Velocity', value: '0', color: 'green' },
        { label: 'Code Coverage', value: '0%', color: 'yellow' },
        { label: 'Bug Count', value: '0', color: 'green' },
      ],
      roles: {
        sponsor: null,
        productOwner: null,
        projectManager: null,
      },
      projectStatus: 'green',
      goal: 'Deliver a high-quality software product',
      description: 'This project aims to develop and deploy a software solution...',
      yearGantt: {
        ...createEmptyGantt(),
        rows: ['Planning', 'Development', 'Testing', 'Deployment'],
        bars: [
          { row: 0, start: 0, end: 1, label: 'Requirements', status: 'green' },
          { row: 1, start: 2, end: 8, label: 'Implementation', status: 'yellow' },
          { row: 2, start: 7, end: 10, label: 'QA Testing', status: 'yellow' },
          { row: 3, start: 11, end: 12, label: 'Production Release', status: 'red' },
        ],
        milestones: [
          { row: 1, at: 2, label: 'Dev Start' },
          { row: 3, at: 12, label: 'Go Live' },
        ],
      },
      quarterGantt: createEmptyQuarterGantt(),
      selectedQuarter: 0,
      done: ['Completed initial planning', 'Set up development environment'],
      next: ['Begin sprint 1', 'Finalize architecture'],
      teamMetrics: [
        { label: 'Team Morale', value: 'High', color: 'green' },
        { label: 'Resource Utilization', value: '85%', color: 'green' },
      ],
      risks: [
        { risk: 'Technical debt accumulation', impact: 'yellow', mitigation: 'Regular refactoring sprints' },
        { risk: 'Scope creep', impact: 'red', mitigation: 'Strict change control process' },
      ],
      artifacts: [
        { label: 'Requirements Doc', url: '#' },
        { label: 'Architecture Design', url: '#' },
      ],
      comments: '',
      extraSections: [],
    },
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Template for marketing campaign projects',
    category: 'marketing',
    data: {
      projectName: 'Marketing Campaign',
      niicDate: new Date().toISOString().split('T')[0],
      kpis: [
        { label: 'Reach', value: '0', color: 'yellow' },
        { label: 'Engagement', value: '0%', color: 'yellow' },
        { label: 'Conversions', value: '0', color: 'red' },
      ],
      roles: {
        sponsor: null,
        productOwner: null,
        projectManager: null,
      },
      projectStatus: 'yellow',
      goal: 'Increase brand awareness and drive conversions',
      description: 'Multi-channel marketing campaign to reach target audience...',
      yearGantt: {
        ...createEmptyGantt(),
        rows: ['Planning', 'Creative', 'Launch', 'Optimize'],
        bars: [
          { row: 0, start: 0, end: 2, label: 'Campaign Strategy', status: 'green' },
          { row: 1, start: 2, end: 5, label: 'Content Creation', status: 'yellow' },
          { row: 2, start: 5, end: 6, label: 'Campaign Launch', status: 'yellow' },
          { row: 3, start: 6, end: 12, label: 'Performance Optimization', status: 'red' },
        ],
        milestones: [
          { row: 2, at: 5, label: 'Launch Date' },
        ],
      },
      quarterGantt: createEmptyQuarterGantt(),
      selectedQuarter: 0,
      done: ['Market research completed', 'Target audience defined'],
      next: ['Develop creative assets', 'Set up tracking'],
      teamMetrics: [
        { label: 'Creative Output', value: 'On Track', color: 'green' },
        { label: 'Budget Usage', value: '45%', color: 'green' },
      ],
      risks: [
        { risk: 'Budget overrun', impact: 'yellow', mitigation: 'Weekly budget reviews' },
        { risk: 'Low engagement rates', impact: 'red', mitigation: 'A/B testing strategy' },
      ],
      artifacts: [
        { label: 'Campaign Brief', url: '#' },
        { label: 'Creative Assets', url: '#' },
      ],
      comments: '',
      extraSections: [],
    },
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Template for new product launch projects',
    category: 'product',
    data: {
      projectName: 'Product Launch',
      niicDate: new Date().toISOString().split('T')[0],
      kpis: [
        { label: 'Pre-orders', value: '0', color: 'yellow' },
        { label: 'Market Readiness', value: '0%', color: 'yellow' },
        { label: 'Launch Readiness', value: '0%', color: 'red' },
      ],
      roles: {
        sponsor: null,
        productOwner: null,
        projectManager: null,
      },
      projectStatus: 'yellow',
      goal: 'Successfully launch new product to market',
      description: 'Comprehensive product launch including development, marketing, and distribution...',
      yearGantt: {
        ...createEmptyGantt(),
        rows: ['Product Dev', 'Marketing', 'Distribution', 'Support'],
        bars: [
          { row: 0, start: 0, end: 7, label: 'Product Development', status: 'yellow' },
          { row: 1, start: 5, end: 12, label: 'Marketing Campaign', status: 'yellow' },
          { row: 2, start: 7, end: 9, label: 'Distribution Setup', status: 'red' },
          { row: 3, start: 9, end: 12, label: 'Customer Support', status: 'red' },
        ],
        milestones: [
          { row: 0, at: 7, label: 'Product Ready' },
          { row: 1, at: 8, label: 'Launch Event' },
        ],
      },
      quarterGantt: createEmptyQuarterGantt(),
      selectedQuarter: 0,
      done: ['Product concept validated', 'Initial prototypes tested'],
      next: ['Finalize product features', 'Begin marketing prep'],
      teamMetrics: [
        { label: 'Development Progress', value: '60%', color: 'yellow' },
        { label: 'Marketing Readiness', value: '30%', color: 'red' },
      ],
      risks: [
        { risk: 'Delayed product completion', impact: 'red', mitigation: 'Agile development approach' },
        { risk: 'Market competition', impact: 'yellow', mitigation: 'Competitive differentiation strategy' },
      ],
      artifacts: [
        { label: 'Product Specs', url: '#' },
        { label: 'Launch Plan', url: '#' },
      ],
      comments: '',
      extraSections: [],
    },
  },
  {
    id: 'construction-project',
    name: 'Construction Project',
    description: 'Template for construction and infrastructure projects',
    category: 'construction',
    data: {
      projectName: 'Construction Project',
      niicDate: new Date().toISOString().split('T')[0],
      kpis: [
        { label: 'Budget Variance', value: '0%', color: 'green' },
        { label: 'Schedule Variance', value: '0 days', color: 'green' },
        { label: 'Safety Incidents', value: '0', color: 'green' },
      ],
      roles: {
        sponsor: null,
        productOwner: null,
        projectManager: null,
      },
      projectStatus: 'green',
      goal: 'Complete construction on time and within budget',
      description: 'Infrastructure construction project with multiple phases...',
      yearGantt: {
        ...createEmptyGantt(),
        rows: ['Design', 'Permits', 'Foundation', 'Construction', 'Finishing'],
        bars: [
          { row: 0, start: 0, end: 2, label: 'Design Phase', status: 'green' },
          { row: 1, start: 2, end: 3, label: 'Permits & Approvals', status: 'yellow' },
          { row: 2, start: 3, end: 5, label: 'Foundation Work', status: 'yellow' },
          { row: 3, start: 5, end: 10, label: 'Main Construction', status: 'red' },
          { row: 4, start: 10, end: 12, label: 'Finishing & Handover', status: 'red' },
        ],
        milestones: [
          { row: 1, at: 3, label: 'Permits Approved' },
          { row: 4, at: 12, label: 'Project Complete' },
        ],
      },
      quarterGantt: createEmptyQuarterGantt(),
      selectedQuarter: 0,
      done: ['Site survey completed', 'Initial designs approved'],
      next: ['Submit permit applications', 'Finalize contractor selection'],
      teamMetrics: [
        { label: 'Worker Productivity', value: 'High', color: 'green' },
        { label: 'Material Delivery', value: 'On Time', color: 'green' },
      ],
      risks: [
        { risk: 'Weather delays', impact: 'yellow', mitigation: 'Buffer time in schedule' },
        { risk: 'Material cost increases', impact: 'red', mitigation: 'Fixed-price contracts where possible' },
      ],
      artifacts: [
        { label: 'Construction Plans', url: '#' },
        { label: 'Safety Plan', url: '#' },
      ],
      comments: '',
      extraSections: [],
    },
  },
]

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter((t) => t.category === category)
}
