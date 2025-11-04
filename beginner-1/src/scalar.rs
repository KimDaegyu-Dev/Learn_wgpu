pub trait Scalar:
    Copy
    + Clone
    + PartialEq
    + Default
    + std::ops::Add<Output = Self>
    + std::ops::Sub<Output = Self>
    + std::ops::Mul<Output = Self>
    + std::ops::Div<Output = Self>
    + std::ops::Neg<Output = Self>
{
    fn zero() -> Self;
    fn one() -> Self;
    fn sqrt(self) -> Self;
}

impl Scalar for f32 {
    fn zero() -> Self {
        0.0
    }
    fn one() -> Self {
        1.0
    }
    fn sqrt(self) -> Self {
        f32::sqrt(self)
    }
}

impl Scalar for f64 {
    fn zero() -> Self {
        0.0
    }
    fn one() -> Self {
        1.0
    }
    fn sqrt(self) -> Self {
        f64::sqrt(self)
    }
}
