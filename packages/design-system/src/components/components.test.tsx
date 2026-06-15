import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Badge,
  Button,
  Card,
  Header,
  Input,
  Layout,
  Main,
  Modal,
  PriceBadge,
  Skeleton,
  StarRating,
} from '../index';

describe('Button', () => {
  it('renders children and handles clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders every variant and size without error', () => {
    (['primary', 'secondary', 'ghost', 'danger', 'success'] as const).forEach((variant) => {
      render(<Button variant={variant}>{variant}</Button>);
    });
    (['sm', 'md', 'lg'] as const).forEach((size) => {
      render(<Button size={size}>{size}</Button>);
    });
    expect(screen.getAllByRole('button').length).toBe(8);
  });

  it('is disabled and shows a spinner while loading', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Card', () => {
  it('renders variants and paddings', () => {
    (['default', 'interactive', 'outlined'] as const).forEach((variant) =>
      render(
        <Card variant={variant} padding="lg">
          card-{variant}
        </Card>,
      ),
    );
    render(<Card padding="none">no-pad</Card>);
    expect(screen.getByText('no-pad')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders each variant', () => {
    (['default', 'accent', 'success', 'warning', 'info'] as const).forEach((variant) =>
      render(
        <Badge variant={variant} size="md">
          {variant}
        </Badge>,
      ),
    );
    expect(screen.getByText('accent')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('associates a label and accepts input', () => {
    render(<Input label="Display Name" placeholder="name" />);
    const input = screen.getByLabelText('Display Name');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue('abc');
  });

  it('renders an error message with aria-invalid', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        hidden
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and content when open, closes on the button and Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Confirm" size="lg">
        body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        body
      </Modal>,
    );
    fireEvent.click(screen.getByRole('dialog').firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Layout / Header / Main', () => {
  it('renders their children', () => {
    render(
      <Layout>
        <Header>header</Header>
        <Main>main</Main>
      </Layout>,
    );
    expect(screen.getByText('header')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });
});

describe('PriceBadge', () => {
  it('shows a discount when originalPrice is higher', () => {
    render(<PriceBadge price={30} originalPrice={60} size="lg" />);
    expect(screen.getByText('-50%')).toBeInTheDocument();
    expect(screen.getByText('$30.00')).toBeInTheDocument();
  });

  it('shows "Free" for a zero price and no discount otherwise', () => {
    render(<PriceBadge price={0} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders each variant with sizing', () => {
    (['text', 'rectangular', 'circular'] as const).forEach((variant) =>
      render(<Skeleton variant={variant} width="10px" height="10px" />),
    );
    expect(screen.getAllByRole('status').length).toBe(3);
  });
});

describe('StarRating', () => {
  it('renders a static rating (with a half star)', () => {
    render(<StarRating rating={3.5} />);
    expect(screen.getByRole('img', { name: /Rating: 3.5/ })).toBeInTheDocument();
  });

  it('supports interactive rating with hover and click', () => {
    const onRate = vi.fn();
    render(<StarRating rating={0} interactive onRate={onRate} size="lg" />);
    const stars = screen.getAllByRole('radio');
    expect(stars.length).toBe(5);
    fireEvent.mouseEnter(stars[2]);
    fireEvent.mouseLeave(stars[2]);
    fireEvent.click(stars[3]);
    expect(onRate).toHaveBeenCalledWith(4);
  });
});
