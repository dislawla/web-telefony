import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatGPT from '../ChatGPT';
import apiRequest from '../../utils/apiRequest';

// Мокаем apiRequest
jest.mock('../../utils/apiRequest');

describe('ChatGPT Component', () => {
  const mockSessions = [
    {
      id: 1,
      client_id: 1,
      title: 'Test Session 1',
      header: 'Test Header 1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      client_id: 1,
      title: 'Test Session 2',
      header: 'Test Header 2',
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
    },
  ];

  beforeEach(() => {
    // Сбрасываем все моки перед каждым тестом
    jest.clearAllMocks();
    
    // Настраиваем мок для apiRequest
    (apiRequest as jest.MockedFunction<typeof apiRequest>).mockImplementation((method, endpoint) => {
      if (endpoint === '/api/ai/sessions') {
        return Promise.resolve(mockSessions);
      }
      if (endpoint === '/api/ai/ask') {
        return Promise.resolve({ answer: 'Test response' });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('renders the component with initial state', async () => {
    render(<ChatGPT />);
    
    // Проверяем, что заголовок отображается
    expect(screen.getByText('ChatGPT')).toBeInTheDocument();
    
    // Проверяем, что сессии загружаются
    await waitFor(() => {
      expect(screen.getByText('Test Header 1')).toBeInTheDocument();
      expect(screen.getByText('Test Header 2')).toBeInTheDocument();
    });
  });

  it('allows selecting a session', async () => {
    render(<ChatGPT />);
    
    // Ждем загрузки сессий
    await waitFor(() => {
      expect(screen.getByText('Test Header 1')).toBeInTheDocument();
    });
    
    // Выбираем вторую сессию
    const select = screen.getByLabelText('Выберите сессию:');
    fireEvent.change(select, { target: { value: '2' } });
    
    // Проверяем, что выбранная сессия изменилась
    expect(select).toHaveValue('2');
  });

  it('allows sending a message and displays response', async () => {
    render(<ChatGPT />);
    
    // Ждем загрузки сессий
    await waitFor(() => {
      expect(screen.getByText('Test Header 1')).toBeInTheDocument();
    });
    
    // Вводим сообщение
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Test message');
    
    // Отправляем сообщение
    const sendButton = screen.getByText('Отправить сообщение');
    await userEvent.click(sendButton);
    
    // Проверяем, что ответ отображается
    await waitFor(() => {
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });
  });

  // Новые тесты для обработки ошибок
  it('handles session loading error', async () => {
    // Мокаем ошибку при загрузке сессий
    (apiRequest as jest.MockedFunction<typeof apiRequest>).mockRejectedValueOnce(
      new Error('Failed to load sessions')
    );

    render(<ChatGPT />);

    // Проверяем, что компонент все еще рендерится
    expect(screen.getByText('ChatGPT')).toBeInTheDocument();

    // Проверяем, что select для сессий пустой
    const select = screen.getByLabelText('Выберите сессию:');
    expect(select).toBeInTheDocument();
    expect(select.children.length).toBe(0);
  });

  it('handles message sending error', async () => {
    // Сначала успешно загружаем сессии
    render(<ChatGPT />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Header 1')).toBeInTheDocument();
    });

    // Мокаем ошибку при отправке сообщения
    (apiRequest as jest.MockedFunction<typeof apiRequest>).mockRejectedValueOnce(
      new Error('Failed to send message')
    );

    // Вводим и отправляем сообщение
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Test message');
    
    const sendButton = screen.getByText('Отправить сообщение');
    await userEvent.click(sendButton);

    // Проверяем, что сообщение об ошибке не отображается в UI
    // (так как в текущей реализации компонента ошибки только логируются)
    expect(screen.queryByText('Failed to send message')).not.toBeInTheDocument();
  });

  it('handles empty message submission', async () => {
    render(<ChatGPT />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Header 1')).toBeInTheDocument();
    });

    // Пытаемся отправить пустое сообщение
    const sendButton = screen.getByText('Отправить сообщение');
    await userEvent.click(sendButton);

    // Проверяем, что apiRequest не был вызван
    expect(apiRequest).not.toHaveBeenCalledWith('POST', '/api/ai/ask', expect.any(Object));
  });
}); 