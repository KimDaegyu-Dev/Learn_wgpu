use std::sync::Arc;

use winit::{
    application::ApplicationHandler,
    event::*,
    event_loop::{ActiveEventLoop, EventLoop},
    keyboard::{Key, NamedKey},
    window::{Window, WindowId},
};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

// 게임의 상태 저장소
pub struct State {
    window: Arc<Window>,
}

impl State {
    pub async fn new(window: Arc<Window>) -> anyhow::Result<Self> {
        Ok(Self { window })
    }

    pub fn resize(&mut self, _width: u32, _height: u32) {}

    // we ask the window to draw another frame as soon as possible
    // 가능한 빨리 다음 프레임을 그리도록 요청함
    // 창이 리사이즈되거나 draw 콜이 날라오면, winit은 한 프레임씩 이상 draw 하기 때문에
    pub fn render(&mut self) {
        self.window.request_redraw();
    }
}

pub struct App {
    #[cfg(target_arch = "wasm32")]
    // 웹에서만 필요한 변수
    // wgpu 리소스를 만드는 것이 비동기 프로세스라
    proxy: Option<winit::event_loop::EventLoopProxy<State>>,

    // State 구조체를 옵션으로 저장함
    // 옵션이 필요한 이유는 State::new()가 window가 필요한데,
    // 애플리케이션 Resumed 상태에 도달할 때까지는 창을 만들 수 없기 떄문에
    state: Option<State>,
}

impl App {
    pub fn new(#[cfg(target_arch = "wasm32")] event_loop: &EventLoop<State>) -> Self {
        #[cfg(target_arch = "wasm32")]
        let proxy = Some(event_loop.create_proxy());
        Self {
            state: None,
            #[cfg(target_arch = "wasm32")]
            proxy,
        }
    }
}

// 키 누르기, 마우스 이동 및 다양한 수명 주기 이벤트와 같은 애플리케이션 이벤트를 가져오는 데 사용할 수 있는 다양한 함수가 제공되는 ApplicationHandler

impl ApplicationHandler<State> for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        #[allow(unused_mut)]
        let mut window_attributes = Window::default_attributes();

        #[cfg(target_arch = "wasm32")]
        {
            use wasm_bindgen::JsCast;
            use winit::platform::web::WindowAttributesExtWebSys;

            const CANVAS_ID: &str = "canvas";

            let window = wgpu::web_sys::window().unwrap_throw();
            let document = window.document().unwrap_throw();
            let canvas = document.get_element_by_id(CANVAS_ID).unwrap_throw();
            let html_canvas_element = canvas.unchecked_into();
            window_attributes = window_attributes.with_canvas(Some(html_canvas_element));
        }

        let window = Arc::new(event_loop.create_window(window_attributes).unwrap());

        #[cfg(not(target_arch = "wasm32"))]
        {
            // If we are not on web we can use pollster to
            // await the
            self.state = Some(pollster::block_on(State::new(window)).unwrap());
        }

        #[cfg(target_arch = "wasm32")]
        {
            // Run the future asynchronously and use the
            // proxy to send the results to the event loop
            if let Some(proxy) = self.proxy.take() {
                wasm_bindgen_futures::spawn_local(async move {
                    assert!(
                        proxy
                            .send_event(
                                State::new(window)
                                    .await
                                    .expect("Unable to create canvas!!!")
                            )
                            .is_ok()
                    )
                });
            }
        }
    }

    #[allow(unused_mut)]
    fn user_event(&mut self, _event_loop: &ActiveEventLoop, mut event: State) {
        // This is where proxy.send_event() ends up
        #[cfg(target_arch = "wasm32")]
        {
            event.window.request_redraw();
            event.resize(
                event.window.inner_size().width,
                event.window.inner_size().height,
            );
        }
        self.state = Some(event);
    }

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        window_id: winit::window::WindowId,
        event: WindowEvent,
    ) {
        let state = match &mut self.state {
            Some(canvas) => canvas,
            None => return,
        };

        match event {
            // 창 닫기
            WindowEvent::CloseRequested => {
                event_loop.exit();
            }

            // 창 크기 변경
            WindowEvent::Resized(size) => {
                if let Some(state) = self.state.as_mut() {
                    state.resize(size.width, size.height);
                    state.render(); // 가능한 빨리 다시 그리기
                }
            }

            // OS가 리드로우 요청
            WindowEvent::RedrawRequested => {
                if let Some(state) = self.state.as_mut() {
                    // 여기에서 wgpu 렌더링 호출을 넣으면 됩니다.
                    // 지금은 다음 프레임 예약만 합니다.
                    state.render();
                }
            }

            // ESC 키로 종료 (원하면)
            WindowEvent::KeyboardInput {
                event:
                    KeyEvent {
                        logical_key: Key::Named(NamedKey::Escape),
                        state: ElementState::Pressed,
                        ..
                    },
                ..
            } => {
                event_loop.exit();
            }

            _ => {}
        }
    }

    // ...
}

// 로거를 설정하고 event_loop와 app을 만든 다음 app을 완료할 때까지 실행됨.
pub fn run() -> anyhow::Result<()> {
    #[cfg(not(target_arch = "wasm32"))]
    {
        env_logger::init();
    }
    #[cfg(target_arch = "wasm32")]
    {
        console_log::init_with_level(log::Level::Info).unwrap_throw();
    }

    let event_loop = EventLoop::with_user_event().build()?;
    let mut app = App::new(
        #[cfg(target_arch = "wasm32")]
        &event_loop,
    );
    event_loop.run_app(&mut app)?;

    Ok(())
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn run_web() -> Result<(), wasm_bindgen::JsValue> {
    console_error_panic_hook::set_once();
    run().unwrap_throw();

    Ok(())
}

fn main() -> anyhow::Result<()> {
    run()
}
