use crate::scalar::Scalar;
use crate::vector::ops::VectorOps;
use std::ops::Mul;

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vec2<T: Scalar> {
    pub x: T,
    pub y: T,
}

impl<T: Scalar> Vec2<T> {
    pub fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Scalar> VectorOps for Vec2<T> {
    type Output = T;

    fn dot(&self, rhs: &Self) -> T {
        self.x * rhs.x + self.y * rhs.y
    }
    fn hadamard(&self, rhs: &Self) -> Self {
        Self {
            x: self.x * rhs.x,
            y: self.y * rhs.y,
        }
    }

    fn norm(&self) -> T {
        self.dot(self).sqrt()
    }

    fn normalize(&self) -> Self {
        let len = self.norm();
        let inv = T::one() / len;
        Self::new(self.x * inv, self.y * inv)
    }
}

// Product
impl<T: Scalar> Mul for Vec2<T> {
    type Output = T;
    fn mul(self, rhs: Self) -> Self::Output {
        self.dot(&rhs)
    }
}

// 스칼라 곱
impl<T: Scalar> Mul<T> for Vec2<T> {
    type Output = Self;
    fn mul(self, rhs: T) -> Self::Output {
        Self {
            x: self.x * rhs,
            y: self.y * rhs,
        }
    }
}
