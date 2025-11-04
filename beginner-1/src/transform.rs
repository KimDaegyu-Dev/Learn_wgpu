// 내적
pub trait Dot<Rhs = Self> {
    type Output;
    fn dot(self, rhs: Rhs) -> Self::Output;
}

// 벡터곱
pub trait Cross<Rhs = Self> {
    type Output;
    fn cross(self, rhs: Rhs) -> Self::Output;
}

// 외적
pub trait Outer<Rhs = Self> {
    type Output;
    fn outer(self, rhs: Rhs) -> Self::Output;
}

// 노름 + 정규화
pub trait Norm {
    type Output;
    fn norm(self) -> Self::Output;
    fn normalize(self) -> Self;
}
pub trait Lerp<T, Rhs = Self> {
    type Output;
    fn lerp(self, rhs: Rhs, t: T) -> Self::Output;
}
