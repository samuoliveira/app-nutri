import type { DomainError } from '@/core/domain/domain-error';

export interface SkeletonRowProps {
  height?: number;
}

export interface SkeletonListProps {
  rows?: number;
}

export interface ErrorViewProps {
  error: DomainError;
  onRetry: () => void;
}

export interface EmptyViewAction {
  label: string;
  onPress: () => void;
}

export interface EmptyViewProps {
  title: string;
  body: string;
  action?: EmptyViewAction;
}
