use crate::{Scalar, Vec2, Vec3, Vec4};
pub trait Lerp<T, Rhs = Self> {
    type Output;
    fn lerp(self, rhs: Rhs, t: T) -> Self::Output;
}

impl<T: Scalar> Lerp<T> for Vec2<T> {
    type Output = Self;

    fn lerp(self, rhs: Self, t: T) -> Self::Output {
        let one = T::one();
        Self {
            x: (one - t) * self.x + t * rhs.x,
            y: (one - t) * self.y + t * rhs.y,
        }
    }
}
impl<T: Scalar> Lerp<T> for Vec3<T> {
    type Output = Self;

    fn lerp(self, rhs: Self, t: T) -> Self::Output {
        let one = T::one();
        Self {
            x: (one - t) * self.x + t * rhs.x,
            y: (one - t) * self.y + t * rhs.y,
            z: (one - t) * self.z + t * rhs.z,
        }
    }
}
impl<T: Scalar> Lerp<T> for Vec4<T> {
    type Output = Self;

    fn lerp(self, rhs: Self, t: T) -> Self::Output {
        let one = T::one();
        Self {
            x: (one - t) * self.x + t * rhs.x,
            y: (one - t) * self.y + t * rhs.y,
            z: (one - t) * self.z + t * rhs.z,
            w: (one - t) * self.w + t * rhs.w,
        }
    }
}
// 전역 함수
pub fn lerp<T, U>(p1: T, p2: T, t: U) -> T::Output
where
    T: Lerp<U>,
{
    p1.lerp(p2, t)
}
