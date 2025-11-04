/// N차원 벡터 공통 연산
pub trait VectorOps<Rhs = Self> {
    type Output;

    fn dot(&self, rhs: &Rhs) -> Self::Output;
    fn hadamard(&self, rhs: &Rhs) -> Self;
    fn norm(&self) -> Self::Output;
    fn normalize(&self) -> Self;
}

/// 3차원 전용 외적
pub trait Cross<Rhs = Self> {
    type Output;
    fn cross(&self, rhs: &Rhs) -> Self::Output;
}
